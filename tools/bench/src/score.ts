import { Array as Arr, Number as Num, Option, pipe } from "effect";

import type { ChoiceItem, Decision, Item, NoulItem, Outcome, ScoreItem } from "./item.ts";

interface Scored {
  readonly item: Item;
  readonly outcome: Outcome;
}

interface Usage {
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly costUsd: number;
  readonly costPer1000Usd: number;
}

interface Metric {
  readonly total: number;
  readonly failed: number;
  readonly raw: number;
  readonly chance: number;
  readonly skill: number;
}

const NONE = 0;
const FULL = 1;
const NOUL_THRESHOLD = 0.5;
const NOUL_OPTIONS = 2;
const P50 = 0.5;
const P95 = 0.95;
const PER_THOUSAND = 1000;
const LAST_OFFSET = 1;

const mean = (values: readonly number[]): number => {
  if (values.length === NONE) {
    return NONE;
  }
  return Num.sumAll(values) / values.length;
};

const choiceCredit = (item: ChoiceItem, decision: Decision): number =>
  Number(decision.type === "choice" && decision.choice === item.gold);

const noulCredit = (item: NoulItem, decision: Decision): number =>
  Number(decision.type === "noul" && decision.noul >= NOUL_THRESHOLD === item.gold);

const scoreCredit = (item: ScoreItem, decision: Decision): number => {
  if (decision.type !== "score") {
    return NONE;
  }
  return FULL - Math.abs(decision.score - item.gold) / (item.options.length - LAST_OFFSET);
};

const decisionCredit = (item: Readonly<Item>, decision: Decision): number => {
  if (item.type === "choice") {
    return choiceCredit(item, decision);
  }
  if (item.type === "noul") {
    return noulCredit(item, decision);
  }
  return scoreCredit(item, decision);
};

const credit = ({ item, outcome }: Readonly<Scored>): number => {
  if (outcome.status === "failed") {
    return NONE;
  }
  return decisionCredit(item, outcome.decision);
};

const chanceOf = (item: Readonly<Item>): number => {
  if (item.type === "noul") {
    return FULL / NOUL_OPTIONS;
  }
  if (item.type === "choice") {
    return FULL / Object.keys(item.options).length;
  }
  const last = item.options.length - LAST_OFFSET;
  return mean(
    Arr.makeBy(item.options.length, (guess) => FULL - Math.abs(guess - item.gold) / last),
  );
};

const rawScore = (rows: readonly Scored[]): number => {
  const isNoul = rows.some(({ item }) => item.type === "noul");
  if (!isNoul) {
    return mean(rows.map((row) => credit(row)));
  }
  const groups = [true, false]
    .map((gold) => rows.filter(({ item }) => item.type === "noul" && item.gold === gold))
    .filter((group) => group.length > NONE);
  return mean(groups.map((group) => mean(group.map((row) => credit(row)))));
};

const skillOf = (raw: number, chance: number): number => {
  if (chance >= FULL) {
    return NONE;
  }
  return Num.clamp((raw - chance) / (FULL - chance), { minimum: NONE, maximum: FULL });
};

const metric = (rows: readonly Scored[]): Metric => {
  const raw = rawScore(rows);
  const chance = mean(rows.map(({ item }) => chanceOf(item)));
  return {
    total: rows.length,
    failed: rows.filter(({ outcome }) => outcome.status === "failed").length,
    raw,
    chance,
    skill: skillOf(raw, chance),
  };
};

const costOf = (outcome: Readonly<Outcome>): number => {
  if (outcome.status === "answered") {
    return outcome.costUsd;
  }
  return NONE;
};

const percentile = (values: readonly number[], rank: number): number => {
  const position = Math.max(NONE, Math.ceil(rank * values.length) - LAST_OFFSET);
  return pipe(
    values.toSorted((left, right) => left - right),
    Arr.get(position),
    Option.getOrElse(() => NONE),
  );
};

const usage = (rows: readonly Scored[]): Usage => {
  const latencies = rows.map(({ outcome }) => outcome.latencyMs);
  const costUsd = Num.sumAll(rows.map(({ outcome }) => costOf(outcome)));
  return {
    p50Ms: percentile(latencies, P50),
    p95Ms: percentile(latencies, P95),
    costUsd,
    costPer1000Usd: (costUsd / Math.max(FULL, rows.length)) * PER_THOUSAND,
  };
};

export { metric, usage };
export type { Metric, Scored, Usage };
