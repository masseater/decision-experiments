import { Schema } from "effect";

import { LabelStatsSchema } from "./labeling.ts";

const MetricSchema = Schema.Struct({
  total: Schema.Finite,
  failed: Schema.Finite,
  raw: Schema.Finite,
  chance: Schema.Finite,
  skill: Schema.Finite,
});

const TaskResultSchema = Schema.Struct({
  task: Schema.String,
  label: Schema.String,
  test: MetricSchema,
  hard: MetricSchema,
  p50Ms: Schema.Finite,
  p95Ms: Schema.Finite,
  costUsd: Schema.Finite,
  costPer1000Usd: Schema.Finite,
});

const ModelResultSchema = Schema.Struct({
  model: Schema.String,
  label: Schema.String,
  index: Schema.Finite,
  costUsd: Schema.Finite,
  tasks: Schema.Array(TaskResultSchema),
});

const SummarySchema = Schema.Struct({
  generatedAt: Schema.String,
  models: Schema.Array(ModelResultSchema),
  labeling: Schema.Array(LabelStatsSchema),
});

type Summary = typeof SummarySchema.Type;

export { SummarySchema };
export type { Summary };
