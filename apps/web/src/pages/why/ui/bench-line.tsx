import type { ReactNode } from "react";

import { CLEAN_TEXTS, INJECTED_TEXTS } from "#/pages/why/model/bench";
import type { BenchRow, Extra } from "#/pages/why/model/bench";
import { COPY } from "#/pages/why/model/copy";
import { cn } from "#/shared/lib/utils";

import { ModelCell } from "./model-cell";

const NONE = 0;

const countClass = (count: number): string =>
  cn("px-2 py-1 font-mono", count !== NONE && "text-destructive");

const extraOf = (extra: Extra): string => {
  if (extra.status === "measured") {
    return `${extra.chars}${COPY.bench.chars}`;
  }
  return COPY.bench.unmeasured;
};

const BenchLine = ({ row }: Readonly<{ row: BenchRow }>): ReactNode => (
  <tr className="border-t">
    <ModelCell row={row} />
    <td className={countClass(row.missed)}>{`${row.missed}/${INJECTED_TEXTS}`}</td>
    <td className={countClass(row.falseAlarms)}>{`${row.falseAlarms}/${CLEAN_TEXTS}`}</td>
    <td className="px-2 py-1 font-mono">{`${row.located}/${INJECTED_TEXTS}`}</td>
    <td className="px-2 py-1 font-mono">{extraOf(row.extra)}</td>
  </tr>
);

export { BenchLine };
