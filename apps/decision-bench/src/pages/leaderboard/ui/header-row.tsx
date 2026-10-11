import type { ReactNode } from "react";

import { TableHead } from "#/shared/ui/table-head";
import { TableRow } from "#/shared/ui/table-row";

const FIRST = 0;

const alignOf = (index: number, align: "start" | "end"): "start" | "end" => {
  if (index === FIRST) {
    return "start";
  }
  return align;
};

const HeaderRow = ({
  headers,
  align,
}: Readonly<{ headers: readonly string[]; align: "start" | "end" }>): ReactNode => (
  <TableRow>
    {headers.map((header, index) => (
      <TableHead key={header} scope="col" justify={alignOf(index, align)}>
        {header}
      </TableHead>
    ))}
  </TableRow>
);

export { HeaderRow };
