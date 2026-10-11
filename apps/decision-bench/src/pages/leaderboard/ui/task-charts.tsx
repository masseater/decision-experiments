import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import { ChartFigure } from "./chart-figure";
import { percent } from "./format";
import { ReliabilityChart } from "./reliability-chart";
import { SpeedChart } from "./speed-chart";
import { taskRows } from "./task-rows";
import type { Measure } from "./task-rows";

const UNSUPPORTED = "未対応（この形式を受け付けない）";
const SKILL_TITLE = "skill（0〜100）";
const SPEED_TITLE = "skill と速度（左上ほど速くて正確）";

const measure: Measure = (result) => ({
  ratio: result.test.skill,
  value: percent(result.test.skill),
});

const TaskCharts = ({ task }: Readonly<{ task: string }>): ReactNode => (
  <div className="grid gap-6 sm:grid-cols-2">
    <ChartFigure title={SKILL_TITLE}>
      <BarChart rows={taskRows({ task, unsupported: UNSUPPORTED, measure })} />
    </ChartFigure>
    <ChartFigure title={SPEED_TITLE}>
      <SpeedChart entries={entriesOf(task)} />
    </ChartFigure>
    {entriesOf(task)
      .filter(({ result }) => result.support === "supported")
      .map((entry) => (
        <ChartFigure
          key={entry.model.model}
          title={`確信度と実際の正解率（${displayLabel(entry)}、対角線に近いほど確信度が正直）`}
        >
          <ReliabilityChart result={entry.result} />
        </ChartFigure>
      ))}
  </div>
);

export { TaskCharts };
