"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

import { useSortDirection, useToggleSort } from "#/pages/leaderboard/model/sorting";
import { Button } from "#/shared/ui/button";
import { TableHead } from "#/shared/ui/table-head";

type Align = "start" | "end";

const ARIA_SORT = { asc: "ascending", desc: "descending", none: "none" } as const;

const ICONS = {
  asc: <ArrowUp data-icon="inline-end" aria-hidden="true" />,
  desc: <ArrowDown data-icon="inline-end" aria-hidden="true" />,
  none: <ArrowUpDown data-icon="inline-end" aria-hidden="true" />,
} as const;

const SortHead = ({
  table,
  column,
  header,
  align,
}: Readonly<{ table: string; column: string; header: string; align: Align }>): ReactNode => {
  const direction = useSortDirection({ table, column });
  const handleToggle = useToggleSort({ table, column });
  return (
    <TableHead
      scope="col"
      aria-sort={ARIA_SORT[direction]}
      data-align={align}
      className="text-left data-[align=end]:text-right"
    >
      <Button variant="ghost" size="xs" onClick={handleToggle}>
        {header}
        {ICONS[direction]}
      </Button>
    </TableHead>
  );
};

export { SortHead };
export type { Align };
