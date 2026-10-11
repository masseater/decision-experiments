import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";
import { percent } from "#/pages/leaderboard/ui/format";

import { BarChart } from "./bar-chart";
import { ChartFigure } from "./chart-figure";
import type { ChartRow } from "./chart-row";
import { ReliabilityChart } from "./reliability-chart";
import { SpeedChart } from "./speed-chart";

const UNSUPPORTED = "未対応（この形式を受け付けない）";
const SKILL_TITLE = "skill（0〜100）";
const SPEED_TITLE = "skill と速度（左上ほど速くて正確）";

const reliabilityTitle = (entry: TaskEntry): string =>
  `確信度と実際の正解率（${displayLabel(entry)}、対角線に近いほど確信度が正直）`;

const skillRows = (task: string): readonly ChartRow[] =>
  entriesOf(task).map((entry): ChartRow => {
    const label = displayLabel(entry);
    if (entry.result.support === "unsupported") {
      return { status: "unsupported", key: entry.model.model, label, note: UNSUPPORTED };
    }
    return {
      status: "measured",
      key: entry.model.model,
      label,
      ratio: entry.result.test.skill,
      value: percent(entry.result.test.skill),
    };
  });

const TaskCharts = ({ task }: Readonly<{ task: string }>): ReactNode => (
  <div className="grid gap-6 sm:grid-cols-2">
    <ChartFigure title={SKILL_TITLE}>
      <BarChart title={SKILL_TITLE} rows={skillRows(task)} />
    </ChartFigure>
    <ChartFigure title={SPEED_TITLE}>
      <SpeedChart title={SPEED_TITLE} entries={entriesOf(task)} />
    </ChartFigure>
    {entriesOf(task)
      .filter(({ result }) => result.support === "supported")
      .map((entry) => (
        <ChartFigure key={entry.model.model} title={reliabilityTitle(entry)}>
          <ReliabilityChart title={reliabilityTitle(entry)} result={entry.result} />
        </ChartFigure>
      ))}
  </div>
);

export { TaskCharts };
