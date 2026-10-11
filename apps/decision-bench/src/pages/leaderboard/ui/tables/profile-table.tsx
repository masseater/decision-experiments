import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";
import type { TaskInfo } from "#/pages/leaderboard/model/ranking";
import { Table } from "#/shared/ui/table";
import { TableBody } from "#/shared/ui/table-body";
import { TableCaption } from "#/shared/ui/table-caption";
import { TableHeader } from "#/shared/ui/table-header";

import { HeaderRow } from "./header-row";
import { ProfileRow } from "./profile-row";

const CAPTION = "確信度・速度・費用";
const LABEL = "モデル";
const METRICS = ["ECE", "Brier", "p50 / p95 ms", "1,000 件あたり"];

const ProfileTable = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => (
  <Table>
    <TableCaption className="mt-0 mb-2 caption-top text-left">{CAPTION}</TableCaption>
    <TableHeader>
      <HeaderRow label={LABEL} metrics={METRICS} />
    </TableHeader>
    <TableBody>
      {entriesOf(task.task)
        .filter(({ result }) => result.support === "supported")
        .map((entry) => (
          <ProfileRow key={entry.model.model} label={displayLabel(entry)} result={entry.result} />
        ))}
    </TableBody>
  </Table>
);

export { ProfileTable };
