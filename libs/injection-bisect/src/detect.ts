import { Array as Arr, Context, Duration, Effect, Option, Ref } from "effect";

import type { JudgeError } from "./judge-error.ts";
import { InjectionJudge } from "./judge.ts";
import type { Verdict } from "./judge.ts";
import { sentencesOf } from "./segment.ts";
import type { Span } from "./segment.ts";

const DEFAULT_MODEL = "respan/span-01-lite";

const DEFAULT_CUTOFF = 0.5;

const MIN_BRANCHES = 2;

const ONE_SENTENCE = 1;

const FIRST = 0;

interface DetectOptions {
  readonly model?: string;
  readonly cutoff?: number;
  readonly branches?: number;
}

const DEFAULTS: Required<Omit<DetectOptions, "branches">> = {
  model: DEFAULT_MODEL,
  cutoff: DEFAULT_CUTOFF,
};

const branchesFor = (sentenceCount: number): number =>
  Math.max(MIN_BRANCHES, Math.ceil(Math.sqrt(sentenceCount)));

interface Region extends Span {
  readonly probability: number;
}

interface Probe extends Span, Verdict {
  readonly depth: number;
  readonly millis: number;
}

type ProbeEvent =
  | (Span & { readonly type: "asked"; readonly id: number; readonly depth: number })
  | (Probe & { readonly type: "answered"; readonly id: number });

const ignore = (): Effect.Effect<void> => Effect.void;

const ProbeListener = Context.Reference<(event: ProbeEvent) => Effect.Effect<void>>(
  "@injection-bisect/core/detect/ProbeListener",
  { defaultValue: () => ignore },
);

type Detection =
  | {
      readonly status: "clean";
      readonly probability: number;
      readonly probes: readonly Probe[];
    }
  | {
      readonly status: "injected";
      readonly probability: number;
      readonly regions: readonly Region[];
      readonly probes: readonly Probe[];
    };

interface Query {
  readonly text: string;
  readonly model: string;
  readonly cutoff: number;
  readonly branches: number;
  readonly record: (probe: Probe) => Effect.Effect<void>;
  readonly nextId: Effect.Effect<number>;
}

interface Range {
  readonly from: number;
  readonly to: number;
}

const ask = Effect.fn("injection-bisect.ask")(function* ask(
  query: Query,
  span: Span,
  depth: number,
) {
  const judge = yield* InjectionJudge;
  const listen = yield* ProbeListener;
  const id = yield* query.nextId;
  yield* Effect.annotateCurrentSpan({ start: span.start, chars: span.end - span.start, depth });
  yield* listen({ type: "asked", id, ...span, depth });
  const [elapsed, verdict] = yield* Effect.timed(
    judge.verdictOf(query.text.slice(span.start, span.end), query.model),
  );
  const probe = { ...span, depth, ...verdict, millis: Duration.toMillis(elapsed) };
  yield* query.record(probe);
  yield* listen({ type: "answered", id, ...probe });
  return verdict.probability;
});

const joinRegions = (text: string, regions: readonly Region[]): readonly Region[] => {
  const sorted = regions.toSorted((left, right) => left.start - right.start);
  const joined: Region[] = [];
  for (const region of sorted) {
    const last = Arr.last(joined);
    if (Option.isSome(last) && text.slice(last.value.end, region.start).trim() === "") {
      joined.splice(-ONE_SENTENCE, ONE_SENTENCE, {
        start: last.value.start,
        end: region.end,
        probability: Math.max(last.value.probability, region.probability),
      });
    } else {
      joined.push(region);
    }
  }
  return joined;
};

const spanOfRange = (sentences: readonly Span[], { from, to }: Range): Span => ({
  start: Option.match(Arr.get(sentences, from), {
    onNone: () => FIRST,
    onSome: ({ start }) => start,
  }),
  end: Option.match(Arr.get(sentences, to - ONE_SENTENCE), {
    onNone: () => FIRST,
    onSome: ({ end }) => end,
  }),
});

const partsOf = ({ from, to }: Range, branches: number): readonly Range[] => {
  const count = Math.min(branches, to - from);
  return Arr.makeBy(count, (index) => ({
    from: from + Math.floor(((to - from) * index) / count),
    to: from + Math.floor(((to - from) * (index + ONE_SENTENCE)) / count),
  }));
};

const locate = (
  query: Query,
  sentences: readonly Span[],
  found: Readonly<Range & { probability: number; depth: number }>,
): Effect.Effect<readonly Region[], JudgeError, InjectionJudge> =>
  Effect.gen(function* locateRange() {
    const whole: readonly Region[] = [
      { ...spanOfRange(sentences, found), probability: found.probability },
    ];
    if (found.to - found.from <= ONE_SENTENCE) {
      return whole;
    }
    const scored = yield* Effect.forEach(
      partsOf(found, query.branches),
      (part) =>
        ask(query, spanOfRange(sentences, part), found.depth + ONE_SENTENCE).pipe(
          Effect.map((probability) => ({
            ...part,
            probability,
            depth: found.depth + ONE_SENTENCE,
          })),
        ),
      { concurrency: "unbounded" },
    );
    const hits = scored.filter(({ probability }) => probability >= query.cutoff);
    if (Arr.isReadonlyArrayEmpty(hits)) {
      return whole;
    }
    const nested = yield* Effect.forEach(hits, (hit) => locate(query, sentences, hit), {
      concurrency: "unbounded",
    });
    return nested.flat();
  });

const detect = Effect.fn("injection-bisect.detect")(function* detect(
  text: string,
  options: DetectOptions,
) {
  const probes = yield* Ref.make<readonly Probe[]>([]);
  const asked = yield* Ref.make(FIRST);
  const sentences = sentencesOf(text);
  const query: Query = {
    text,
    ...DEFAULTS,
    ...options,
    branches: options.branches ?? branchesFor(sentences.length),
    record: (probe) => Ref.update(probes, (recorded) => [...recorded, probe]),
    nextId: Ref.getAndUpdate(asked, (count) => count + ONE_SENTENCE),
  };
  const probability = yield* ask(query, { start: FIRST, end: text.length }, FIRST);
  if (probability < query.cutoff) {
    return {
      status: "clean",
      probability,
      probes: yield* Ref.get(probes),
    } satisfies Detection;
  }
  const regions = yield* locate(query, sentences, {
    from: FIRST,
    to: sentences.length,
    probability,
    depth: FIRST,
  });
  return {
    status: "injected",
    probability,
    regions: joinRegions(text, regions),
    probes: yield* Ref.get(probes),
  } satisfies Detection;
});

export { DEFAULT_CUTOFF, DEFAULT_MODEL, ProbeListener, branchesFor, detect };
export type { Detection, DetectOptions, Probe, ProbeEvent, Region };
