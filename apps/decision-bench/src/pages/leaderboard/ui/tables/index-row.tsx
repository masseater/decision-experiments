import type { ReactNode } from "react";

import type { ModelResult } from "#/pages/leaderboard/model/summary";
import { percent, usd } from "#/pages/leaderboard/ui/format";
import { TableCell } from "#/shared/ui/table-cell";
import { TableHead } from "#/shared/ui/table-head";
import { TableRow } from "#/shared/ui/table-row";

const IndexRow = ({ model }: Readonly<{ model: ModelResult }>): ReactNode => (
  <TableRow>
    <TableHead scope="row">{model.label}</TableHead>
    <TableCell className="text-right tabular-nums">{percent(model.index)}</TableCell>
    <TableCell className="text-right tabular-nums">{usd(model.costUsd)}</TableCell>
  </TableRow>
);

export { IndexRow };
