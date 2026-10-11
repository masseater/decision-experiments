const PERCENT = 100;
const PERCENT_DIGITS = 1;
const COST_DIGITS = 4;
const SCORE_DIGITS = 3;

const percent = (value: number): string => (value * PERCENT).toFixed(PERCENT_DIGITS);

const points = (value: number): string => value.toFixed(PERCENT_DIGITS);

const pointsOf = (value: unknown): string => points(Number(value));

const toPercentPoints = (ratio: number): number => ratio * PERCENT;

const usd = (value: number): string => `$${value.toFixed(COST_DIGITS)}`;

const withInterval = ({
  value,
  interval,
}: Readonly<{ value: number; interval: Readonly<{ lower: number; upper: number }> }>): string =>
  `${percent(value)}（${percent(interval.lower)}〜${percent(interval.upper)}）`;

const decimal = (value: number): string => value.toFixed(SCORE_DIGITS);

export { decimal, percent, pointsOf, toPercentPoints, usd, withInterval };
