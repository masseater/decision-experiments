import summaryJson from "bench/summary";
import type { Summary } from "bench/summary-schema";

type ModelResult = Summary["models"][number];
type TaskResult = ModelResult["tasks"][number];
type LabelStats = Summary["labeling"][number];

const summary: Summary = summaryJson;

export { summary };
export type { LabelStats, ModelResult, TaskResult };
