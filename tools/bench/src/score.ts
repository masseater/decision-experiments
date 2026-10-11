import { Array as Arr, Number as Num, Option, pipe } from "effect";
import { ConfusionMatrix } from "ml-confusion-matrix";
import seedrandom from "seedrandom";
import { quantile, sampleWithReplacement } from "simple-statistics";

import { calibrationOf } from "./calibration.ts";
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
const LAST_OFFSET = 1;
const TWO = 2;

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

const UNANSWERED = "unanswered";

const predictedChoice = ({ outcome }: Readonly<Scored>): string => {
  if (outcome.status === "answered" && outcome.decision.type === "choice") {
    return outcome.decision.choice;
  }
  return UNANSWERED;
};

const predictedNoul = ({ outcome }: Readonly<Scored>): string => {
  if (outcome.status === "answered" && outcome.decision.type === "noul") {
    return String(outcome.decision.noul >= NOUL_THRESHOLD);
  }
  return UNANSWERED;
};

const goldOf = ({ item }: Readonly<Scored>): string => String(item.gold);

const optionKeys = (item: Readonly<Item>): readonly string[] => {
  if (item.type === "choice") {
    return Object.keys(item.options);
  }
  return [];
};

const choiceClasses = (rows: readonly Scored[]): readonly string[] => [
  ...new Set(rows.flatMap(({ item }) => optionKeys(item))),
];

const confusionOf = (
  rows: readonly Scored[],
  classes: readonly string[],
  predicted: (row: Readonly<Scored>) => string,
): ConfusionMatrix<string> =>
  ConfusionMatrix.fromLabels(
    rows.map((row) => goldOf(row)),
    rows.map((row) => predicted(row)),
    { labels: [...classes, UNANSWERED] },
  );

const finiteOrZero = (value: number): number => {
  if (Number.isFinite(value)) {
    return value;
  }
  return NONE;
};

const balancedAccuracy = (rows: readonly Scored[]): number => {
  const classes = [String(true), String(false)];
  const confusion = confusionOf(rows, classes, predictedNoul);
  return mean(
    classes
      .filter((label) => confusion.getPositiveCount(label) > NONE)
      .map((label) => confusion.getTruePositiveRate(label)),
  );
};

const macroF1 = (rows: readonly Scored[]): number => {
  const classes = choiceClasses(rows);
  const confusion = confusionOf(rows, classes, predictedChoice);
  return mean(classes.map((label) => finiteOrZero(confusion.getF1Score(label))));
};

const macroF1Chance = (rows: readonly Scored[]): number => {
  const classes = choiceClasses(rows);
  const guess = FULL / Math.max(FULL, classes.length);
  return mean(
    classes.map((label) => {
      const prevalence =
        rows.filter((row) => goldOf(row) === label).length / Math.max(FULL, rows.length);
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

const PAIR_MEMBER = /-\d+[ab]$/u;
const PAIR_SIZE = 2;
const SIDE_LENGTH = 1;

const pairOf = ({ item }: Readonly<Scored>): string => item.id.slice(NONE, -SIDE_LENGTH);

const RESAMPLES = 1000;
const SEED = "ja-decision-bench";
const LOWER = 0.025;
const UPPER = 0.975;

type Cluster = readonly Scored[];
type Interval = Readonly<{ lower: number; upper: number }>;

const clusterKey = (row: Readonly<Scored>): string => {
  if (PAIR_MEMBER.test(row.item.id)) {
    return pairOf(row);
  }
  return row.item.id;
};

const intervalOf = (values: readonly number[]): Interval => {
  if (values.length === NONE) {
    return { lower: NONE, upper: NONE };
  }
  return { lower: quantile([...values], LOWER), upper: quantile([...values], UPPER) };
};

const isSolvedPair = (cluster: Cluster): boolean =>
  cluster.length === PAIR_SIZE && cluster.every((row) => credit(row) === FULL);

const pairRate = (clusters: readonly Cluster[]): number => {
  const pairs = clusters.filter((cluster) => cluster.length === PAIR_SIZE);
  return pairs.filter((pair) => isSolvedPair(pair)).length / Math.max(FULL, pairs.length);
};

const skillOfRows = (rows: readonly Scored[]): number => {
  const { raw, chance } = rawScore(rows);
  return skillOf(raw, chance);
};

const resample = (clusters: readonly Cluster[]): readonly (readonly Cluster[])[] => {
  const random = seedrandom(SEED);
  return Arr.makeBy(RESAMPLES, () =>
    sampleWithReplacement([...clusters], clusters.length, () => random()),
  );
};

const pairAccuracyOf = (
  clusters: readonly Cluster[],
  samples: readonly (readonly Cluster[])[],
): TaskResult["test"]["pairs"] => {
  const count = clusters.filter((cluster) => cluster.length === PAIR_SIZE).length;
  if (count === NONE) {
    return { status: "unavailable" };
  }
  return {
    status: "measured",
    accuracy: pairRate(clusters),
    count,
    interval: intervalOf(samples.map((sample) => pairRate(sample))),
  };
};

const metric = (rows: readonly Scored[]): TaskResult["test"] => {
  const { raw, chance } = rawScore(rows);
  const clusters = Object.values(Arr.groupBy(rows, clusterKey));
  const samples = resample(clusters);
  const failed = rows.filter(({ outcome }) => outcome.status === "failed").length;
  return {
    total: rows.length,
    failed,
    coverage: (rows.length - failed) / Math.max(FULL, rows.length),
    raw,
    accuracy: mean(rows.map((row) => credit(row))),
    chance,
    skill: skillOf(raw, chance),
    skillInterval: intervalOf(samples.map((sample) => skillOfRows(sample.flat()))),
    calibration: calibrationOf(rows),
    pairs: pairAccuracyOf(clusters, samples),
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

const usage = (rows: readonly Scored[]): Pick<TaskResult, "p50Ms" | "p95Ms" | "costUsd"> => {
  const latencies = rows.map(({ outcome }) => outcome.latencyMs);
  const costUsd = Num.sumAll(rows.map(({ outcome }) => costOf(outcome)));
  return {
    p50Ms: percentile(latencies, P50),
    p95Ms: percentile(latencies, P95),
    costUsd,
  };
};

export { metric, usage };
export type { Scored };
