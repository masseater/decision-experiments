import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";
import type { TaskInfo } from "#/pages/leaderboard/model/ranking";

import { HeaderRow } from "./header-row";
import { METRIC_NAMES } from "./metric-names";
import { ScoreRow } from "./score-row";

const CAPTION = "成績（test）";

const headersOf = (task: Readonly<TaskInfo>): readonly string[] => [
  "モデル",
  "skill",
  METRIC_NAMES[task.metric],
  "正解率",
  "coverage",
];

const ScoreTable = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => (
  <table className="w-full text-xs sm:text-sm">
    <caption className="pb-2 text-left text-sm font-medium">{CAPTION}</caption>
    <thead>
      <HeaderRow headers={headersOf(task)} align="end" />
    </thead>
    <tbody>
      {entriesOf(task.task).map((entry) => (
        <ScoreRow key={entry.model.model} label={displayLabel(entry)} result={entry.result} />
      ))}
    </tbody>
  </table>
);

export { ScoreTable };
