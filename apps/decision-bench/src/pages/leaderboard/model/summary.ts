import summaryJson from "bench/summary";
import { SummarySchema } from "bench/summary-schema";
import type { Summary } from "bench/summary-schema";
import { Schema } from "effect";

type ModelResult = Summary["models"][number];
type TaskResult = ModelResult["tasks"][number];
type LabelStats = Summary["labeling"][number];

const EMPTY: Summary = { generatedAt: "", models: [], labeling: [] };

const toSummary = (value: unknown): Summary => {
  if (Schema.is(SummarySchema)(value)) {
    return value;
  }
  return EMPTY;
};

const summary = toSummary(summaryJson);

export { summary };
export type { LabelStats, ModelResult, TaskResult };
