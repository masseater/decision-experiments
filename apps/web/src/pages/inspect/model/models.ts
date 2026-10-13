import { DEFAULT_MODEL } from "@r_masseater/injection-bisect";

const MAX_CHARS = 8000;

const MODELS = [
  DEFAULT_MODEL,
  "respan/span-01",
  "perplexity/pplx-decider-v1.1-27b",
  "typesafe/jev-1.13",
  "inception/mercury-decide",
] as const;

export { MAX_CHARS, MODELS };
