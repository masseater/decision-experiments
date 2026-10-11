import { describe, expect, it } from "vite-plus/test";

import type { Item, Outcome } from "./item.ts";
import { metric, usage } from "./score.ts";

const NONE = 0;
const ONE = 1;
const OPTION_COUNT = 3;
const THIRD = ONE / OPTION_COUNT;
const TWO = 2;
const TWO_THIRDS = TWO / OPTION_COUNT;
const MACRO_F1 = TWO_THIRDS / OPTION_COUNT;
const BRIER = 0.02;
const HALF = 0.5;
const HIGH = 0.9;
const HIGHER = 0.8;
const MID_HIGH = 0.7;
const MID = 0.6;
const LOW = 0.1;
const FAST_MS = 100;
const ANSWERED_COST = 0.001;
const PER_THOUSAND = 1000;

const base = {
  text: "state",
  criteria: "question",
  gold_source: "llm",
  agreement: ONE,
  source: "test",
  license: "CC BY-SA 4.0",
  split: "test",
} as const;

const choice = (id: string, gold: string): Item => ({
  ...base,
  id,
  type: "choice",
  options: { yes: "yes", no: "no", maybe: "maybe" },
  gold,
});

const noul = (id: string, gold: boolean): Item => ({
  ...base,
  id,
  type: "noul",
  options: { true: "はい", false: "いいえ" },
  gold,
});

const picked = (pick: string): Outcome => ({
  status: "answered",
  decision: { type: "choice", choice: pick },
  latencyMs: 100,
  costUsd: 0.001,
});

const probability = (value: number): Outcome => ({
  status: "answered",
  decision: { type: "noul", noul: value },
  latencyMs: 200,
  costUsd: 0,
});

const failure: Outcome = { status: "failed", reason: "unsupported", latencyMs: FAST_MS };

describe("metric", () => {
  it("scores choice by macro-F1 and counts failures as wrong", () => {
    const result = metric([
      { item: choice("a", "yes"), outcome: picked("yes") },
      { item: choice("b", "no"), outcome: picked("yes") },
      { item: choice("c", "maybe"), outcome: failure },
    ]);
    expect(result.raw).toBeCloseTo(MACRO_F1);
    expect(result.accuracy).toBeCloseTo(THIRD);
    expect(result.chance).toBeCloseTo(THIRD);
    expect(result.skill).toBe(NONE);
    expect(result.failed).toBe(ONE);
    expect(result.coverage).toBeCloseTo(TWO_THIRDS);
  });

  it("measures calibration from noul probabilities", () => {
    const result = metric([
      { item: noul("a", true), outcome: probability(HIGH) },
      { item: noul("b", false), outcome: probability(LOW) },
    ]);
    if (result.calibration.status !== "measured") {
      throw new Error("calibration should be measured");
    }
    expect(result.calibration.ece).toBeCloseTo(LOW);
    expect(result.calibration.brier).toBeCloseTo(BRIER);
    expect(result.calibration.forecasts).toBe(TWO);
  });

  it("uses balanced accuracy for noul", () => {
    const result = metric([
      { item: noul("a", true), outcome: probability(HIGH) },
      { item: noul("b", true), outcome: probability(HIGHER) },
      { item: noul("c", true), outcome: probability(MID_HIGH) },
      { item: noul("d", false), outcome: probability(MID) },
    ]);
    expect(result.raw).toBeCloseTo(HALF);
    expect(result.skill).toBe(NONE);
  });

  it("gives full skill to a perfect noul model", () => {
    const result = metric([
      { item: noul("a", true), outcome: probability(HIGH) },
      { item: noul("b", false), outcome: probability(LOW) },
    ]);
    expect(result.skill).toBe(ONE);
  });
});

describe("usage", () => {
  it("reports latency percentiles and cost per 1,000 decisions", () => {
    const result = usage([
      { item: choice("a", "yes"), outcome: picked("yes") },
      { item: choice("b", "no"), outcome: picked("no") },
      { item: choice("c", "maybe"), outcome: failure },
    ]);
    expect(result.p50Ms).toBe(FAST_MS);
    expect(result.p95Ms).toBe(FAST_MS);
    expect(result.costPer1000Usd).toBeCloseTo(
      (ANSWERED_COST + ANSWERED_COST) * THIRD * PER_THOUSAND,
    );
  });
});
