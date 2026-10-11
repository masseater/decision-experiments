import type { Sort } from "#/pages/leaderboard/model/sorting";

import { LABEL_ID } from "./sort-header-row";
import type { TableColumn } from "./table-column";

const SIGN = { asc: 1, desc: -1 } as const;
const LOCALE = "ja";
const EQUAL = 0;

const compareOf = <Row>({
  column,
  columns,
  labelOf,
}: Readonly<{
  column: string;
  columns: readonly TableColumn<Row>[];
  labelOf: (row: Row) => string;
}>): ((left: Row, right: Row) => number) => {
  if (column === LABEL_ID) {
    return (left, right) => labelOf(left).localeCompare(labelOf(right), LOCALE);
  }
  const values = columns.filter(({ id }) => id === column).map(({ sortValue }) => sortValue);
  return (left, right) =>
    values.map((value) => value(left) - value(right)).find((delta) => delta !== EQUAL) ?? EQUAL;
};

const sortRows = <Row>({
  rows,
  sort,
  columns,
  labelOf,
}: Readonly<{
  rows: readonly Row[];
  sort: Sort;
  columns: readonly TableColumn<Row>[];
  labelOf: (row: Row) => string;
}>): readonly Row[] => {
  if (sort.status === "default") {
    return rows;
  }
  const compare = compareOf({ column: sort.column, columns, labelOf });
  const sign = SIGN[sort.direction];
  return rows.toSorted((left, right) => sign * compare(left, right));
};

export { sortRows };
