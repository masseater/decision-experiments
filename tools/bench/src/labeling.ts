import { Schema } from "effect";

const UNANIMOUS = 1;

const LabelStatsSchema = Schema.Struct({
  task: Schema.String,
  items: Schema.Finite,
  hard: Schema.Finite,
  opusCostUsd: Schema.Finite,
  opusMatchesHuman: Schema.optionalKey(Schema.Finite),
});

const LABEL_CONCURRENCY = 4;

const splitOf = (agreement: number): "test" | "hard" => {
  if (agreement === UNANIMOUS) {
    return "test";
  }
  return "hard";
};

export { LABEL_CONCURRENCY, LabelStatsSchema, splitOf };
