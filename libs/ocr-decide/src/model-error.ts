import { Data } from "effect";

class ModelError extends Data.TaggedError("ModelError")<{ readonly reason: string }> {}

export { ModelError };
