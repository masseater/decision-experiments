import { Array as Arr, Number as Num, Option, pipe } from "effect";

import type { ChoiceItem, Decision, Item, NoulItem, Outcome, ScoreItem } from "./item.ts";
import type { TaskResult } from "./summary.ts";

interface Scored {
  readonly item: Item;
  readonly outcome: Outcome;
}

const NONE = 0;
const FULL = 1;
const NOUL_THRESHOLD = 0.5;
const NOUL_OPTIONS = 2;
const P50 = 0.5;
const P95 = 0.95;
const PER_THOUSAND = 1000;
const LAST_OFFSET = 1;
const TWO = 2;
const CALIBRATION_BINS = 10;

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

const balancedAccuracy = (rows: readonly Scored[]): number => {
  const groups = [true, false]
    .map((gold) => rows.filter(({ item }) => item.type === "noul" && item.gold === gold))
    .filter((group) => group.length > NONE);
  return mean(groups.map((group) => mean(group.map((row) => credit(row)))));
};

const predictedChoice = ({ outcome }: Readonly<Scored>): Option.Option<string> => {
  if (outcome.status === "answered" && outcome.decision.type === "choice") {
    return Option.some(outcome.decision.choice);
  }
  return Option.none();
};

const choiceGold = ({ item }: Readonly<Scored>): Option.Option<string> => {
  if (item.type === "choice") {
    return Option.some(item.gold);
  }
  return Option.none();
};

const optionKeys = (item: Readonly<Item>): readonly string[] => {
  if (item.type === "choice") {
    return Object.keys(item.options);
  }
  return [];
};

const choiceClasses = (rows: readonly Scored[]): readonly string[] => [
  ...new Set(rows.flatMap(({ item }) => optionKeys(item))),
];

const f1Of = (rows: readonly Scored[], label: string): number => {
  const isPredicted = (row: Readonly<Scored>): boolean =>
    Option.contains(predictedChoice(row), label);
  const isGold = (row: Readonly<Scored>): boolean => Option.contains(choiceGold(row), label);
  const truePositive = rows.filter((row) => isPredicted(row) && isGold(row)).length;
  const falsePositive = rows.filter((row) => isPredicted(row) && !isGold(row)).length;
  const falseNegative = rows.filter((row) => !isPredicted(row) && isGold(row)).length;
  const denominator = TWO * truePositive + falsePositive + falseNegative;
  if (denominator === NONE) {
    return NONE;
  }
  return (TWO * truePositive) / denominator;
};

const macroF1 = (rows: readonly Scored[]): number =>
  mean(choiceClasses(rows).map((label) => f1Of(rows, label)));

const macroF1Chance = (rows: readonly Scored[]): number => {
  const classes = choiceClasses(rows);
  const guess = FULL / Math.max(FULL, classes.length);
  return mean(
    classes.map((label) => {
      const prevalence =
        rows.filter((row) => Option.contains(choiceGold(row), label)).length /
        Math.max(FULL, rows.length);
      return (TWO * prevalence * guess) / Math.max(Number.EPSILON, prevalence + guess);
    }),
  );
};

const rawScore = (rows: readonly Scored[]): Readonly<{ raw: number; chance: number }> => {
  if (rows.some(({ item }) => item.type === "noul")) {
    return { raw: balancedAccuracy(rows), chance: FULL / NOUL_OPTIONS };
  }
  if (rows.some(({ item }) => item.type === "choice")) {
    return { raw: macroF1(rows), chance: macroF1Chance(rows) };
  }
  return {
    raw: mean(rows.map((row) => credit(row))),
    chance: mean(rows.map(({ item }) => chanceOf(item))),
  };
};

const skillOf = (raw: number, chance: number): number => {
  if (chance >= FULL) {
    return NONE;
  }
  return Num.clamp((raw - chance) / (FULL - chance), { minimum: NONE, maximum: FULL });
};

interface Forecast {
  readonly confidence: number;
  readonly correct: number;
  readonly brier: number;
}

const choiceForecast = (item: ChoiceItem, decision: Decision): Option.Option<Forecast> => {
  if (decision.type !== "choice" || !("probabilities" in decision)) {
    return Option.none();
  }
  const { probabilities } = decision;
  const labels = Object.keys(item.options);
  const probabilityOf = (label: string): number => probabilities[label] ?? NONE;
  return Option.some({
    confidence: Math.max(NONE, ...labels.map((label) => probabilityOf(label))),
    correct: Number(decision.choice === item.gold),
    brier: Num.sumAll(
      labels.map((label) => (probabilityOf(label) - Number(label === item.gold)) ** TWO),
    ),
  });
};

const noulForecast = (item: NoulItem, decision: Decision): Option.Option<Forecast> => {
  if (decision.type !== "noul") {
    return Option.none();
  }
  const truth = Number(item.gold);
  return Option.some({
    confidence: Math.max(decision.noul, FULL - decision.noul),
    correct: noulCredit(item, decision),
    brier: TWO * (decision.noul - truth) ** TWO,
  });
};

const forecastOf = ({ item, outcome }: Readonly<Scored>): Option.Option<Forecast> => {
  if (outcome.status === "failed") {
    return Option.none();
  }
  if (item.type === "choice") {
    return choiceForecast(item, outcome.decision);
  }
  if (item.type === "noul") {
    return noulForecast(item, outcome.decision);
  }
  return Option.none();
};

const binOf = (confidence: number): number =>
  Math.min(CALIBRATION_BINS - LAST_OFFSET, Math.floor(confidence * CALIBRATION_BINS));

const expectedCalibrationError = (forecasts: readonly Forecast[]): number =>
  Num.sumAll(
    Arr.makeBy(CALIBRATION_BINS, (bin) => {
      const inBin = forecasts.filter(({ confidence }) => binOf(confidence) === bin);
      const gap = Math.abs(
        mean(inBin.map(({ correct }) => correct)) - mean(inBin.map(({ confidence }) => confidence)),
      );
      return (inBin.length / Math.max(FULL, forecasts.length)) * gap;
    }),
  );

const calibrationOf = (rows: readonly Scored[]): TaskResult["test"]["calibration"] => {
  const forecasts = rows.flatMap((row) => Option.toArray(forecastOf(row)));
  if (forecasts.length === NONE) {
    return { status: "unavailable" };
  }
  return {
    status: "measured",
    ece: expectedCalibrationError(forecasts),
    brier: mean(forecasts.map(({ brier }) => brier)),
    forecasts: forecasts.length,
  };
};

const metric = (rows: readonly Scored[]): TaskResult["test"] => {
  const { raw, chance } = rawScore(rows);
  const failed = rows.filter(({ outcome }) => outcome.status === "failed").length;
  return {
    total: rows.length,
    failed,
    coverage: (rows.length - failed) / Math.max(FULL, rows.length),
    raw,
    accuracy: mean(rows.map((row) => credit(row))),
    chance,
    skill: skillOf(raw, chance),
    calibration: calibrationOf(rows),
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

const usage = (
  rows: readonly Scored[],
): Pick<TaskResult, "p50Ms" | "p95Ms" | "costUsd" | "costPer1000Usd"> => {
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
export type { Scored };
