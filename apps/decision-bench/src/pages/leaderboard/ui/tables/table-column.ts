type TableColumn<Row> = Readonly<{
  id: string;
  header: string;
  sortValue: (row: Row) => number;
  display: (row: Row) => string;
}>;

type Align = "start" | "end";

export type { Align, TableColumn };
