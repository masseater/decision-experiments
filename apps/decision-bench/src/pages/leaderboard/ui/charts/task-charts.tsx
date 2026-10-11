import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import { ChartFigure } from "./chart-figure";
import type { ChartRow } from "./chart-row";
import { taskDetail } from "./model-detail";
import { ModelKey } from "./model-key";
import { COST_AXIS, LATENCY_AXIS, scatterPoints } from "./scatter-points";
import { ScoreScatter } from "./score-scatter";

const SKILL_TITLE = "skill";
const LATENCY_TITLE = "skill × p50 レイテンシ";
const COST_TITLE = "skill × タスク全体の費用";

const skillRows = (entries: readonly TaskEntry[]): readonly ChartRow[] =>
  entries.map((entry): ChartRow => {
    const label = displayLabel(entry);
    if (entry.result.support === "unsupported") {
      return { status: "unsupported", key: entry.model.model, label };
    }
    return {
      status: "interval",
      key: entry.model.model,
      label,
      detail: taskDetail(entry),
      ratio: entry.result.test.skill,
      interval: entry.result.test.skillInterval,
    };
  });

const TaskCharts = ({ entries }: Readonly<{ entries: readonly TaskEntry[] }>): ReactNode => (
  <div className="flex flex-col gap-10">
    <ChartFigure title={SKILL_TITLE}>
      <BarChart title={SKILL_TITLE} rows={skillRows(entries)} />
    </ChartFigure>
    <ChartFigure title={LATENCY_TITLE}>
      <ScoreScatter
        title={LATENCY_TITLE}
        axis={LATENCY_AXIS}
        points={scatterPoints({
          entries,
          axis: LATENCY_AXIS,
          measureOf: ({ result }) => result.p50Ms,
        })}
      />
    </ChartFigure>
    <ChartFigure title={COST_TITLE}>
      <ScoreScatter
        title={COST_TITLE}
        axis={COST_AXIS}
        points={scatterPoints({
          entries,
          axis: COST_AXIS,
          measureOf: ({ result }) => result.costUsd,
        })}
      />
    </ChartFigure>
    <ModelKey entries={entries} />
  </div>
);

export { TaskCharts };
