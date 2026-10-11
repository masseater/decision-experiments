import type { ReactNode } from "react";

import type { TableColumn } from "#/pages/leaderboard/model/sorting";
import { TableCell } from "#/shared/ui/table-cell";
import { TableHead } from "#/shared/ui/table-head";
import { TableRow } from "#/shared/ui/table-row";

const SortBodyRow = <Row,>({
  row,
  label,
  columns,
}: Readonly<{ row: Row; label: string; columns: readonly TableColumn<Row>[] }>): ReactNode => (
  <TableRow>
    <TableHead scope="row">{label}</TableHead>
    {columns.map((column) => (
      <TableCell key={column.id} className="text-right tabular-nums">
        {column.display(row)}
      </TableCell>
    ))}
  </TableRow>
);

export { SortBodyRow };
