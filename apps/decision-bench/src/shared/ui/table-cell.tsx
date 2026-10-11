import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const ALIGN_CLASSES = { start: "text-left", end: "text-right tabular-nums" } as const;

const TableCell = ({
  className,
  justify = "start",
  ...props
}: ComponentProps<"td"> & Readonly<{ justify?: keyof typeof ALIGN_CLASSES }>): ReactNode => (
  <td
    data-slot="table-cell"
    className={cn(
      "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      ALIGN_CLASSES[justify],
      className,
    )}
    {...props}
  />
);

export { TableCell };
