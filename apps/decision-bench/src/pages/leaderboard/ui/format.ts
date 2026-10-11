const PERCENT = 100;
const PERCENT_DIGITS = 1;
const COST_DIGITS = 4;
const SCORE_DIGITS = 3;

const percent = (value: number): string => (value * PERCENT).toFixed(PERCENT_DIGITS);

const usd = (value: number): string => `$${value.toFixed(COST_DIGITS)}`;

const decimal = (value: number): string => value.toFixed(SCORE_DIGITS);

export { decimal, percent, usd };
