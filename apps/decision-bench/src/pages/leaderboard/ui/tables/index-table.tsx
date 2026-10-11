import type { ReactNode } from "react";

import type { ModelResult } from "#/pages/leaderboard/model/summary";
import { percent, usd } from "#/pages/leaderboard/ui/format";

import { SortableTable } from "./sortable-table";
import type { TableColumn } from "./table-column";

const CAPTION = "指数と費用";
const LABEL = "モデル";

const keyOf = ({ model }: ModelResult): string => model;
const labelOf = ({ label }: ModelResult): string => label;

const COLUMNS: readonly TableColumn<ModelResult>[] = [
  {
    id: "index",
    header: "指数",
    sortValue: ({ index }) => index,
    display: ({ index }) => percent(index),
  },
  {
    id: "cost",
    header: "全タスクの費用",
    sortValue: ({ costUsd }) => costUsd,
    display: ({ costUsd }) => usd(costUsd),
  },
];

const IndexTable = ({ models }: Readonly<{ models: readonly ModelResult[] }>): ReactNode => (
  <SortableTable
    id="index"
    caption={CAPTION}
    label={LABEL}
    rows={models}
    keyOf={keyOf}
    labelOf={labelOf}
    columns={COLUMNS}
  />
);

export { IndexTable };
