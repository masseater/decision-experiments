import type { ReactNode } from "react";

import { TableHead } from "#/shared/ui/table-head";
import { TableRow } from "#/shared/ui/table-row";

const HeaderRow = ({
  label,
  metrics,
}: Readonly<{ label: string; metrics: readonly string[] }>): ReactNode => (
  <TableRow>
    <TableHead scope="col">{label}</TableHead>
    {metrics.map((metric) => (
      <TableHead key={metric} scope="col" className="text-right tabular-nums">
        {metric}
      </TableHead>
    ))}
  </TableRow>
);

export { HeaderRow };
