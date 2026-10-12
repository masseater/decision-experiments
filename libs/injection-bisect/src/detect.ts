import { Array as Arr, Effect, Option } from "effect";

import type { JudgeError } from "./judge-error.ts";
import { InjectionJudge } from "./judge.ts";
import { sentencesOf } from "./segment.ts";
import type { Span } from "./segment.ts";

const DEFAULT_MODEL = "respan/span-01-lite";

const DEFAULT_CUTOFF = 0.5;

const HALF = 2;

const ONE_SENTENCE = 1;

const FIRST = 0;

interface DetectOptions {
  readonly model?: string;
  readonly cutoff?: number;
}

interface Region extends Span {
  readonly probability: number;
}

type Detection =
  | { readonly status: "clean"; readonly probability: number }
  | {
      readonly status: "injected";
      readonly probability: number;
      readonly regions: readonly Region[];
    };

interface Probe {
  readonly text: string;
  readonly model: string;
  readonly cutoff: number;
}

interface Range {
  readonly from: number;
  readonly to: number;
}

const ask = Effect.fn("injection-bisect.ask")(function* ask(probe: Probe, span: Span) {
  const judge = yield* InjectionJudge;
  yield* Effect.annotateCurrentSpan({ start: span.start, chars: span.end - span.start });
  return yield* judge.probabilityOf(probe.text.slice(span.start, span.end), probe.model);
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

const halvesOf = ({ from, to }: Range): readonly [Range, Range] => {
  const middle = Math.floor((from + to) / HALF);
  return [
    { from, to: middle },
    { from: middle, to },
  ];
};

const locate = (
  probe: Probe,
  sentences: readonly Span[],
  found: Readonly<Range & { probability: number }>,
): Effect.Effect<readonly Region[], JudgeError, InjectionJudge> =>
  Effect.gen(function* locateRange() {
    const whole: readonly Region[] = [
      { ...spanOfRange(sentences, found), probability: found.probability },
    ];
    if (found.to - found.from <= ONE_SENTENCE) {
      return whole;
    }
    const scored = yield* Effect.forEach(
      halvesOf(found),
      (half) =>
        ask(probe, spanOfRange(sentences, half)).pipe(
          Effect.map((probability) => ({ ...half, probability })),
        ),
      { concurrency: "unbounded" },
    );
    const hits = scored.filter(({ probability }) => probability >= probe.cutoff);
    if (Arr.isReadonlyArrayEmpty(hits)) {
      return whole;
    }
    const nested = yield* Effect.forEach(hits, (hit) => locate(probe, sentences, hit), {
      concurrency: "unbounded",
    });
    return nested.flat();
  });

const detect = Effect.fn("injection-bisect.detect")(function* detect(
  text: string,
  options: DetectOptions,
) {
  const probe: Probe = {
    text,
    model: options.model ?? DEFAULT_MODEL,
    cutoff: options.cutoff ?? DEFAULT_CUTOFF,
  };
  const probability = yield* ask(probe, { start: FIRST, end: text.length });
  if (probability < probe.cutoff) {
    return { status: "clean", probability } satisfies Detection;
  }
  const sentences = sentencesOf(text);
  const regions = yield* locate(probe, sentences, {
    from: FIRST,
    to: sentences.length,
    probability,
  });
  return {
    status: "injected",
    probability,
    regions: joinRegions(text, regions),
  } satisfies Detection;
});

export { DEFAULT_CUTOFF, DEFAULT_MODEL, detect };
export type { Detection, DetectOptions, Region };
