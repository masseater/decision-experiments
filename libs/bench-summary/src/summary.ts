import { Schema } from "effect";

const LabelStatsSchema = Schema.Struct({
  task: Schema.String,
  items: Schema.Finite,
  hard: Schema.Finite,
  opusCostUsd: Schema.Finite,
  opusMatchesHuman: Schema.optionalKey(Schema.Finite),
  opusSampled: Schema.optionalKey(Schema.Finite),
});

const CalibrationBinSchema = Schema.Struct({
  meanPredicted: Schema.Finite,
  observedFrequency: Schema.Finite,
  count: Schema.Finite,
});

const CalibrationSchema = Schema.Union([
  Schema.Struct({
    status: Schema.Literal("measured"),
    ece: Schema.Finite,
    brier: Schema.Finite,
    forecasts: Schema.Finite,
    curve: Schema.Array(CalibrationBinSchema),
  }),
  Schema.Struct({ status: Schema.Literal("unavailable") }),
]);

const IntervalSchema = Schema.Struct({ lower: Schema.Finite, upper: Schema.Finite });

const PairsSchema = Schema.Union([
  Schema.Struct({
    status: Schema.Literal("measured"),
    accuracy: Schema.Finite,
    count: Schema.Finite,
    interval: IntervalSchema,
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
  skillInterval: IntervalSchema,
  calibration: CalibrationSchema,
  pairs: PairsSchema,
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
});

const ModelResultSchema = Schema.Struct({
  provider: Schema.Literals(["openrouter"]),
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

export { LabelStatsSchema, SummarySchema };
export type { Summary, TaskResult };
