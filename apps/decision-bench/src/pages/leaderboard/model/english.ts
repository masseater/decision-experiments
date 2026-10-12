import type { TaskId } from "bench-summary/schema";
import { Option, Schema } from "effect";

import referenceJson from "./english-reference.json";
import { rankedModels } from "./ranking";
import type { ModelResult, TaskResult } from "./summary";

const ReferenceSchema = Schema.Struct({
  source: Schema.Struct({
    name: Schema.String,
    url: Schema.String,
    commit: Schema.String,
    retrievedAt: Schema.String,
    license: Schema.String,
  }),
  models: Schema.Array(
    Schema.Struct({
      model: Schema.String,
      entry: Schema.String,
      accuracy: Schema.Finite,
      pairAccuracy: Schema.Finite,
    }),
  ),
});

type Reference = typeof ReferenceSchema.Type;
type EnglishScore = Reference["models"][number];

type Scores = Readonly<{ accuracy: number; pairAccuracy: number }>;

type EnglishRow = Readonly<{
  model: ModelResult;
  entry: string;
  english: Scores;
  japanese: Scores;
}>;

const JAPANESE_TASK: TaskId = "rules";

const EMPTY: Reference = {
  source: { name: "", url: "", commit: "", retrievedAt: "", license: "" },
  models: [],
};

const reference = Option.getOrElse(
  Schema.decodeOption(ReferenceSchema)(referenceJson),
  (): Reference => EMPTY,
);

const japaneseOf = (result: TaskResult): readonly Scores[] => {
  if (result.test.pairs.status === "unavailable") {
    return [];
  }
  return [{ accuracy: result.test.accuracy, pairAccuracy: result.test.pairs.accuracy }];
};

const rowsOf = (model: ModelResult, score: EnglishScore): readonly EnglishRow[] =>
  model.tasks
    .filter((result) => result.task === JAPANESE_TASK)
    .flatMap((result) => japaneseOf(result))
    .map((japanese) => ({
      model,
      entry: score.entry,
      english: { accuracy: score.accuracy, pairAccuracy: score.pairAccuracy },
      japanese,
    }));

const englishRows: readonly EnglishRow[] = rankedModels.flatMap((model) =>
  reference.models
    .filter((score) => score.model === model.model)
    .flatMap((score) => rowsOf(model, score)),
);

const englishSource = reference.source;

export { englishRows, englishSource };
export type { EnglishRow };
