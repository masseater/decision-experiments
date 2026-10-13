import { HAIKU_REFERENCE } from "./haiku-reference";

type Judge = "decision" | "chat" | "agent";

type Extra = Readonly<{ status: "measured"; chars: number }> | Readonly<{ status: "unmeasured" }>;

interface BenchRow {
  readonly model: string;
  readonly judge: Judge;
  readonly missed: number;
  readonly falseAlarms: number;
  readonly located: number;
  readonly extra: Extra;
  readonly medianMs: number;
  readonly dollarsPerText: number;
}

const MEASURED_ON = "2026-10-13";

const INJECTED_TEXTS = 19;

const CLEAN_TEXTS = 6;

const BENCH: readonly BenchRow[] = [
  {
    model: "typesafe/jev-1.13",
    judge: "decision",
    missed: 0,
    falseAlarms: 0,
    located: 18,
    extra: { status: "measured", chars: 7 },
    medianMs: 406,
    dollarsPerText: 0.000148,
  },
  {
    model: "inception/mercury-decide",
    judge: "decision",
    missed: 0,
    falseAlarms: 0,
    located: 19,
    extra: { status: "measured", chars: 12 },
    medianMs: 760,
    dollarsPerText: 0.00002,
  },
  {
    model: "respan/span-01-lite",
    judge: "decision",
    missed: 2,
    falseAlarms: 0,
    located: 15,
    extra: { status: "measured", chars: 14 },
    medianMs: 741,
    dollarsPerText: 0,
  },
  {
    model: "perplexity/pplx-decider-v1.1-27b",
    judge: "decision",
    missed: 8,
    falseAlarms: 0,
    located: 9,
    extra: { status: "measured", chars: 23 },
    medianMs: 348,
    dollarsPerText: 0.000024,
  },
  {
    model: "anthropic/claude-haiku-5.5",
    judge: "chat",
    missed: 0,
    falseAlarms: 0,
    located: 18,
    extra: { status: "measured", chars: 2 },
    medianMs: 1406,
    dollarsPerText: 0.000112,
  },
  {
    model: "anthropic/claude-sonnet-5.5",
    judge: "chat",
    missed: 0,
    falseAlarms: 0,
    located: 19,
    extra: { status: "measured", chars: 2 },
    medianMs: 2403,
    dollarsPerText: 0.002324,
  },
  {
    model: "anthropic/claude-haiku-5.5 (claude -p)",
    judge: "agent",
    ...HAIKU_REFERENCE,
    extra: { status: "unmeasured" },
  },
];

export { BENCH, CLEAN_TEXTS, INJECTED_TEXTS, MEASURED_ON };
export type { BenchRow, Extra, Judge };
