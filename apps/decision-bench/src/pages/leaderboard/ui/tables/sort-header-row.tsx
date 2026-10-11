import type { ReactNode } from "react";

import { LABEL_ID } from "#/pages/leaderboard/model/sorting";
import type { TableColumn } from "#/pages/leaderboard/model/sorting";
import { TableRow } from "#/shared/ui/table-row";

import { SortHead } from "./sort-head";

const SortHeaderRow = <Row,>({
  table,
  label,
  columns,
}: Readonly<{ table: string; label: string; columns: readonly TableColumn<Row>[] }>): ReactNode => (
  <TableRow>
    <SortHead table={table} column={LABEL_ID} header={label} align="start" />
    {columns.map((column) => (
      <SortHead
        key={column.id}
        table={table}
        column={column.id}
        header={column.header}
        align="end"
      />
    ))}
  </TableRow>
);

export { SortHeaderRow };
