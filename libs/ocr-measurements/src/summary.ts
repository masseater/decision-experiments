import { Schema } from "effect";

const METHODS = ["ocr-decision", "ocr-reread-decision", "image-generation"] as const;

const MethodSchema = Schema.Literals(METHODS);

const RateMapSchema = Schema.Record(Schema.String, Schema.Finite);

const RunSchema = Schema.Struct({
  method: MethodSchema,
  model: Schema.String,
  label: Schema.String,
  accuracy: Schema.Finite,
  byField: RateMapSchema,
  byGroup: RateMapSchema,
  secondsPerDocument: Schema.Finite,
  usdPerDocument: Schema.Finite,
  failed: Schema.Finite,
});

const SummarySchema = Schema.Struct({
  generatedAt: Schema.String,
  documents: Schema.Finite,
  generatorModel: Schema.String,
  cutoff: Schema.Finite,
  rereadBelow: Schema.Finite,
  fields: Schema.Array(Schema.Struct({ id: Schema.String, label: Schema.String })),
  groups: Schema.Array(Schema.Struct({ id: Schema.String, label: Schema.String })),
  runs: Schema.Array(RunSchema),
});

type Method = typeof MethodSchema.Type;

type Run = typeof RunSchema.Type;

type Summary = typeof SummarySchema.Type;

export { METHODS, SummarySchema };
export type { Method, Run, Summary };
