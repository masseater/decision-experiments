import type { ReactNode } from "react";

import { BarRow } from "./bar-row";
import type { ChartRow } from "./chart-row";

const BarChart = ({
  title,
  rows,
}: Readonly<{ title: string; rows: readonly ChartRow[] }>): ReactNode => (
  <figure className="flex flex-col gap-2">
    <figcaption className="text-sm font-medium">{title}</figcaption>
    <ul className="flex flex-col gap-1.5 text-sm">
      {rows.map((row) => (
        <BarRow key={row.key} row={row} />
      ))}
    </ul>
  </figure>
);

export { BarChart };
