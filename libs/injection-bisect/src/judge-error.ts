import { Data } from "effect";

class JudgeError extends Data.TaggedError("JudgeError")<{ readonly reason: string }> {}

export { JudgeError };
