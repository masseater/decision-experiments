import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";
import type { TaskInfo } from "#/pages/leaderboard/model/ranking";
import { Table } from "#/shared/ui/table";
import { TableBody } from "#/shared/ui/table-body";
import { TableCaption } from "#/shared/ui/table-caption";
import { TableHeader } from "#/shared/ui/table-header";

import { HeaderRow } from "./header-row";
import { METRIC_NAMES } from "./metric-names";
import { ScoreRow } from "./score-row";

const CAPTION = "成績（test）";

const LABEL = "モデル";

const metricsOf = (task: Readonly<TaskInfo>): readonly string[] => [
  "skill",
  METRIC_NAMES[task.metric],
  "正解率",
  "coverage",
];

const ScoreTable = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => (
  <Table>
    <TableCaption className="mt-0 mb-2 caption-top text-left">{CAPTION}</TableCaption>
    <TableHeader>
      <HeaderRow label={LABEL} metrics={metricsOf(task)} />
    </TableHeader>
    <TableBody>
      {entriesOf(task.task).map((entry) => (
        <ScoreRow key={entry.model.model} label={displayLabel(entry)} result={entry.result} />
      ))}
    </TableBody>
  </Table>
);

export { ScoreTable };
