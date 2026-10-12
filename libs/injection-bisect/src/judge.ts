import { Context } from "effect";
import type { Effect } from "effect";

import type { JudgeError } from "./judge-error.ts";

interface Verdict {
  readonly probability: number;
  readonly cost: number;
  readonly model: string;
  readonly inputTokens: number;
}

class InjectionJudge extends Context.Service<
  InjectionJudge,
  {
    readonly verdictOf: (text: string, model: string) => Effect.Effect<Verdict, JudgeError>;
  }
>()("@injection-bisect/core/judge/InjectionJudge") {}

export { InjectionJudge };
export type { Verdict };
