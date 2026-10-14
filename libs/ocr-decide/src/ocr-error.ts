import { Data } from "effect";

class OcrError extends Data.TaggedError("OcrError")<{ readonly reason: string }> {}

export { OcrError };
