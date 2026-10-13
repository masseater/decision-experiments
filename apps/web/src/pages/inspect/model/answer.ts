import type { Detection, Region } from "@injection-bisect/core";
import { Array as Arr, Option } from "effect";

import { EXAMPLES } from "./examples";
import type { Example } from "./examples";
import type { Phase } from "./trace";

interface Span {
  readonly start: number;
  readonly end: number;
}

type Grade =
  | { readonly status: "unknown" }
  | { readonly status: "pending" }
  | { readonly status: "correct-clean" }
  | { readonly status: "false-alarm" }
  | { readonly status: "missed" }
  | { readonly status: "found"; readonly covered: number; readonly extra: number };

const PERCENT = 100;

const exampleOf = (text: string): Option.Option<Example> =>
  Arr.findFirst(EXAMPLES, (example) => example.text === text);

const answerSpanOf = (text: string): Option.Option<Span> =>
  exampleOf(text).pipe(
    Option.flatMap((example) => {
      if (example.kind === "clean") {
        return Option.none();
      }
      const start = example.text.indexOf(example.answer);
      return Option.some({ start, end: start + example.answer.length });
    }),
  );

const answerOf = (text: string): readonly Span[] => Option.toArray(answerSpanOf(text));

const visibleIn = (text: string, { start, end }: Span): number =>
  text.slice(start, end).replaceAll(/\s/gu, "").length;

const overlapOf = (left: Span, right: Span): Span => ({
  start: Math.max(left.start, right.start),
  end: Math.max(Math.max(left.start, right.start), Math.min(left.end, right.end)),
});

const foundGrade = (text: string, answer: Span, regions: readonly Region[]): Grade => {
  let hit = 0;
  let found = 0;
  for (const region of regions) {
    hit += visibleIn(text, overlapOf(answer, region));
    found += visibleIn(text, region);
  }
  return {
    status: "found",
    covered: Math.round((hit / visibleIn(text, answer)) * PERCENT),
    extra: found - hit,
  };
};

const cleanGrade = (detection: Detection): Grade => {
  if (detection.status === "clean") {
    return { status: "correct-clean" };
  }
  return { status: "false-alarm" };
};

const injectedGrade = (text: string, detection: Detection, answer: Span): Grade => {
  if (detection.status === "clean") {
    return { status: "missed" };
  }
  return foundGrade(text, answer, detection.regions);
};

const gradeOf = ({ text, phase }: Readonly<{ text: string; phase: Phase }>): Grade => {
  if (Option.isNone(exampleOf(text)) || phase.status === "failed") {
    return { status: "unknown" };
  }
  if (phase.status === "running") {
    return { status: "pending" };
  }
  return Option.match(answerSpanOf(text), {
    onNone: () => cleanGrade(phase.detection),
    onSome: (answer) => injectedGrade(text, phase.detection, answer),
  });
};

export type { Grade };
export { answerOf, gradeOf };
