import { InjectionJudge, detect, removeRegions } from "@r_masseater/injection-bisect";
import type { DetectOptions, JudgeError, Verdict, Verdicts } from "@r_masseater/injection-bisect";
import { Effect } from "effect";

const INJECTION_MARK = "無視して";

const INJECTED = 0.97;

const CLEAN = 0.02;

const NO_COST = 0;

const MODEL = "test/model";

const ENGLISH_MARK = "ignore previous instructions";

const probabilityOf = (text: string): number => {
  if (text.includes(INJECTION_MARK) || text.toLowerCase().includes(ENGLISH_MARK)) {
    return INJECTED;
  }
  return CLEAN;
};

const fakeJudge = {
  verdictOf: (text: string): Effect.Effect<Verdict> =>
    Effect.succeed({
      probability: probabilityOf(text),
      cost: NO_COST,
      model: MODEL,
      inputTokens: NO_COST,
    }),
  verdictsOf: ({ parts }: Readonly<{ parts: readonly string[] }>): Effect.Effect<Verdicts> =>
    Effect.succeed({
      probabilities: parts.map((part) => probabilityOf(part)),
      cost: NO_COST,
      model: MODEL,
      inputTokens: NO_COST,
    }),
};

interface Cleaned {
  readonly found: readonly string[];
  readonly cleaned: string;
}

const cleanedOf = ({
  text,
  ...options
}: Readonly<{ text: string } & DetectOptions>): Effect.Effect<Cleaned, JudgeError> =>
  detect(text, options).pipe(
    Effect.map((detection) => {
      if (detection.status === "clean") {
        return { found: [], cleaned: text };
      }
      return {
        found: detection.regions.map(({ start, end }) => text.slice(start, end)),
        cleaned: removeRegions({ text, regions: detection.regions }),
      };
    }),
    Effect.provideService(InjectionJudge, fakeJudge),
  );

export { ENGLISH_MARK, INJECTION_MARK, cleanedOf };
export type { Cleaned };
