import { Context } from "effect";
import type { Effect } from "effect";

import type { JudgeError } from "./judge-error.ts";

class InjectionJudge extends Context.Service<
  InjectionJudge,
  {
    readonly probabilityOf: (text: string, model: string) => Effect.Effect<number, JudgeError>;
  }
>()("@injection-bisect/core/judge/InjectionJudge") {}

export { InjectionJudge };
