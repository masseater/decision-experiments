const PERCENT = 100;
const PERCENT_DIGITS = 1;
const COST_DIGITS = 4;

const percent = (value: number): string => (value * PERCENT).toFixed(PERCENT_DIGITS);

const usd = (value: number): string => `$${value.toFixed(COST_DIGITS)}`;

export { percent, usd };
