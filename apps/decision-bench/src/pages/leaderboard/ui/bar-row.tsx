import type { ReactNode } from "react";

import { Bar } from "./bar";
import type { ChartRow } from "./chart-row";

const ROW = "flex items-center gap-3";
const LABEL = "w-28 shrink-0 truncate sm:w-48";

const BarRow = ({ row }: Readonly<{ row: ChartRow }>): ReactNode => {
  if (row.status === "unsupported") {
    return (
      <li className={ROW}>
        <span className={LABEL}>{row.label}</span>
        <span className="text-muted-foreground text-xs">{row.note}</span>
      </li>
    );
  }
  return (
    <li className={ROW} title={`${row.label}: ${row.value}`}>
      <span className={LABEL}>{row.label}</span>
      <Bar ratio={row.ratio} />
      <span className="w-24 shrink-0 text-right tabular-nums sm:w-36">{row.value}</span>
    </li>
  );
};

export { BarRow };
