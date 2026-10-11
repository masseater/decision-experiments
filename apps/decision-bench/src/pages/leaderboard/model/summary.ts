import summaryJson from "bench/summary";
import type { Summary } from "bench/summary-schema";

const PERCENT = 100;
const PERCENT_DIGITS = 1;
const COST_DIGITS = 4;

type ModelResult = Summary["models"][number];
type TaskResult = ModelResult["tasks"][number];
type LabelStats = Summary["labeling"][number];

const summary: Summary = summaryJson;

const percent = (value: number): string => (value * PERCENT).toFixed(PERCENT_DIGITS);

const usd = (value: number): string => `$${value.toFixed(COST_DIGITS)}`;

export { percent, summary, usd };
export type { LabelStats, ModelResult, TaskResult };
