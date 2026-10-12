const MODELS = {
  span: "respan/span-01-lite",
  decider: "perplexity/pplx-decider-v1.1-27b",
} as const;

type ModelChoice = keyof typeof MODELS;

const MAX_CHARS = 8000;

const MODEL_CHOICES = ["span", "decider"] as const satisfies readonly ModelChoice[];

export type { ModelChoice };
export { MAX_CHARS, MODEL_CHOICES, MODELS };
