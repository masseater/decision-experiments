import { Schema } from "effect";

import { LabelStatsSchema } from "./labeling.ts";

const CalibrationSchema = Schema.Union([
  Schema.Struct({
    status: Schema.Literal("measured"),
    ece: Schema.Finite,
    brier: Schema.Finite,
    forecasts: Schema.Finite,
  }),
  Schema.Struct({ status: Schema.Literal("unavailable") }),
]);

const MetricSchema = Schema.Struct({
  total: Schema.Finite,
  failed: Schema.Finite,
  coverage: Schema.Finite,
  raw: Schema.Finite,
  accuracy: Schema.Finite,
  chance: Schema.Finite,
  skill: Schema.Finite,
  calibration: CalibrationSchema,
});

const TaskResultSchema = Schema.Struct({
  task: Schema.String,
  label: Schema.String,
  metric: Schema.Literals(["macro-f1", "balanced-accuracy", "normalized-mae"]),
  format: Schema.Literals(["choice", "noul", "score"]),
  support: Schema.Literals(["supported", "unsupported"]),
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
  choiceVia: Schema.Literals(["choice", "noul"]),
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
type TaskResult = typeof TaskResultSchema.Type;

export { SummarySchema };
export type { Summary, TaskResult };
