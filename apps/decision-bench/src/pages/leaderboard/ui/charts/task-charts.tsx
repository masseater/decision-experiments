import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import { ChartFigure } from "./chart-figure";
import type { ChartRow } from "./chart-row";
import { ModelKey } from "./model-key";
import { COST_AXIS, LATENCY_AXIS, scatterPoints } from "./scatter-points";
import { ScoreScatter } from "./score-scatter";

const SKILL_TITLE = "skill";
const LATENCY_TITLE = "skill × p50 レイテンシ";
const COST_TITLE = "skill × タスク全体の費用";

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

const TaskCharts = ({ task }: Readonly<{ task: string }>): ReactNode => (
  <div className="grid gap-6 sm:grid-cols-2">
    <ChartFigure title={SKILL_TITLE}>
      <BarChart title={SKILL_TITLE} rows={skillRows(task)} />
    </ChartFigure>
    <ChartFigure title={LATENCY_TITLE}>
      <ScoreScatter
        title={LATENCY_TITLE}
        axis={LATENCY_AXIS}
        points={scatterPoints({
          task,
          axis: LATENCY_AXIS,
          measureOf: ({ result }) => result.p50Ms,
        })}
      />
    </ChartFigure>
    <ChartFigure title={COST_TITLE}>
      <ScoreScatter
        title={COST_TITLE}
        axis={COST_AXIS}
        points={scatterPoints({ task, axis: COST_AXIS, measureOf: ({ result }) => result.costUsd })}
      />
    </ChartFigure>
    <ModelKey task={task} />
  </div>
);

export { TaskCharts };
