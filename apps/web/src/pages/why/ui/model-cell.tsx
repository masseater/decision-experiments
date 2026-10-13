import type { ReactNode } from "react";

import type { BenchRow } from "#/pages/why/model/bench";
import { COPY } from "#/pages/why/model/copy";

const ModelCell = ({ row }: Readonly<{ row: BenchRow }>): ReactNode => (
  <td className="px-2 py-1">
    <span className="block font-mono text-xs">{row.model}</span>
    <span className="text-muted-foreground block text-xs">{COPY.bench.judge[row.judge]}</span>
  </td>
);

export { ModelCell };
