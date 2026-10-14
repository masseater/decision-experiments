import { Data } from "effect";

class ResultsError extends Data.TaggedError("ResultsError")<{ readonly reason: string }> {}

export { ResultsError };
