import type { Run } from "@ocr-decide/measurements/schema";
import type { ReactNode } from "react";

import { wayOf } from "#/pages/measurements/model/summary";
import type { Column } from "#/pages/measurements/model/tables";

const RunRow = ({
  run,
  columns,
}: Readonly<{ run: Run; columns: readonly Column[] }>): ReactNode => (
  <tr className="border-t">
    <th className="px-3 py-2 text-left font-normal">{wayOf(run)}</th>
    {columns.map(({ id, cell }) => (
      <td key={id} className="px-3 py-2 font-mono whitespace-nowrap">
        {cell(run)}
      </td>
    ))}
  </tr>
);

export { RunRow };
