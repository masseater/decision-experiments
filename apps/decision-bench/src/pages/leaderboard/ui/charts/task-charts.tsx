import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";
import { toPercentPoints } from "#/pages/leaderboard/ui/format";

import { BarChart } from "./bar-chart";
import { ChartFigure } from "./chart-figure";
import type { ChartRow } from "./chart-row";
import { ORIGIN } from "./chart-style";
import { errorOf } from "./interval-bar";
import { ScoreScatter } from "./score-scatter";
import type { Axis, ScatterPoint } from "./score-scatter";

const SKILL_TITLE = "skill";
const LATENCY_TITLE = "skill × p50 レイテンシ";
const COST_TITLE = "skill × タスク全体の費用";
const HEADROOM = 1.3;
const LATENCY_STEP = 100;
const MIN_COST_USD = 0.1;
const COST_PRECISION = 1000;
const COST_STEP = 10;

const LATENCY_AXIS: Axis = {
  name: "p50 ms",
  domain: [ORIGIN, (max) => Math.ceil((max * HEADROOM) / LATENCY_STEP) * LATENCY_STEP],
  format: String,
};

const COST_AXIS: Axis = {
  name: "USD",
  domain: [
    ORIGIN,
    (max) => Math.max(Math.ceil(max * HEADROOM * COST_STEP) / COST_STEP, MIN_COST_USD),
  ],
  format: (value) => `$${Math.round(Number(value) * COST_PRECISION) / COST_PRECISION}`,
};

const skillRows = (task: string): readonly ChartRow[] =>
  entriesOf(task).map((entry): ChartRow => {
    const label = displayLabel(entry);
    if (entry.result.support === "unsupported") {
      return { status: "unsupported", key: entry.model.model, label };
    }
    return {
      status: "interval",
      key: entry.model.model,
      label,
      ratio: entry.result.test.skill,
      interval: entry.result.test.skillInterval,
    };
  });

const scatterPoints = (
  task: string,
  measureOf: (entry: TaskEntry) => number,
): readonly ScatterPoint[] =>
  entriesOf(task)
    .filter(({ result }) => result.support === "supported")
    .map((entry) => {
      const skill = toPercentPoints(entry.result.test.skill);
      const { lower, upper } = entry.result.test.skillInterval;
      return {
        label: displayLabel(entry),
        measure: measureOf(entry),
        skill,
        error: errorOf({
          value: skill,
          lower: toPercentPoints(lower),
          upper: toPercentPoints(upper),
        }),
      };
    });

const TaskCharts = ({ task }: Readonly<{ task: string }>): ReactNode => (
  <div className="grid gap-6 sm:grid-cols-2">
    <ChartFigure title={SKILL_TITLE}>
      <BarChart title={SKILL_TITLE} rows={skillRows(task)} />
    </ChartFigure>
    <ChartFigure title={LATENCY_TITLE}>
      <ScoreScatter
        title={LATENCY_TITLE}
        axis={LATENCY_AXIS}
        points={scatterPoints(task, ({ result }) => result.p50Ms)}
      />
    </ChartFigure>
    <ChartFigure title={COST_TITLE}>
      <ScoreScatter
        title={COST_TITLE}
        axis={COST_AXIS}
        points={scatterPoints(task, ({ result }) => result.costUsd)}
      />
    </ChartFigure>
  </div>
);

export { TaskCharts };
