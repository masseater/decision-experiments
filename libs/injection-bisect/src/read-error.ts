import { Data } from "effect";

class ReadError extends Data.TaggedError("ReadError")<{ readonly reason: string }> {}

export { ReadError };
