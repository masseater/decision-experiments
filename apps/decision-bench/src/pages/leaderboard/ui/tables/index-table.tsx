import type { ReactNode } from "react";

import { rankedModels } from "#/pages/leaderboard/model/ranking";
import { Table } from "#/shared/ui/table";
import { TableBody } from "#/shared/ui/table-body";
import { TableHeader } from "#/shared/ui/table-header";

import { HeaderRow } from "./header-row";
import { IndexRow } from "./index-row";

const LABEL = "モデル";
const METRICS = ["指数", "全タスクの費用"];

const IndexTable = (): ReactNode => (
  <Table>
    <TableHeader>
      <HeaderRow label={LABEL} metrics={METRICS} />
    </TableHeader>
    <TableBody>
      {rankedModels.map((model) => (
        <IndexRow key={model.model} model={model} />
      ))}
    </TableBody>
  </Table>
);

export { IndexTable };
