const PERCENT = 100;
const PERCENT_DIGITS = 1;
const COST_DIGITS = 4;
const MIN_TOTAL = 1;

const percent = (value: number): string => (value * PERCENT).toFixed(PERCENT_DIGITS);

const usd = (value: number): string => `$${value.toFixed(COST_DIGITS)}`;

const ms = (value: number): string => `${value.toLocaleString("ja-JP")} ms`;

const failureRate = (metric: Readonly<{ failed: number; total: number }>): string =>
  `${percent(metric.failed / Math.max(MIN_TOTAL, metric.total))}%`;

export { failureRate, ms, percent, usd };
