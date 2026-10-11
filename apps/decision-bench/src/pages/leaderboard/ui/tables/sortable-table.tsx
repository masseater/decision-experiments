"use client";

import type { ReactNode } from "react";

import { useSort } from "#/pages/leaderboard/model/sorting";
import { Table } from "#/shared/ui/table";
import { TableBody } from "#/shared/ui/table-body";
import { TableCaption } from "#/shared/ui/table-caption";
import { TableHeader } from "#/shared/ui/table-header";

import { SortBodyRow } from "./sort-body-row";
import { SortHeaderRow } from "./sort-header-row";
import { sortRows } from "./sort-rows";
import type { TableColumn } from "./table-column";

const SortableTable = <Row,>({
  id,
  caption,
  label,
  rows,
  keyOf,
  labelOf,
  columns,
}: Readonly<{
  id: string;
  caption: string;
  label: string;
  rows: readonly Row[];
  keyOf: (row: Row) => string;
  labelOf: (row: Row) => string;
  columns: readonly TableColumn<Row>[];
}>): ReactNode => {
  const sorted = sortRows({ rows, sort: useSort(id), columns, labelOf });
  return (
    <Table>
      <TableCaption className="mt-0 mb-2 caption-top text-left">{caption}</TableCaption>
      <TableHeader>
        <SortHeaderRow table={id} label={label} columns={columns} />
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <SortBodyRow key={keyOf(row)} row={row} label={labelOf(row)} columns={columns} />
        ))}
      </TableBody>
    </Table>
  );
};

export { SortableTable };
