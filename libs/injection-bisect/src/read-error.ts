import { Data } from "effect";

class ReadError extends Data.TaggedError("ReadError")<{ readonly reason: string }> {}

const readErrorOf = (cause: unknown): ReadError => new ReadError({ reason: String(cause) });

export { ReadError, readErrorOf };
