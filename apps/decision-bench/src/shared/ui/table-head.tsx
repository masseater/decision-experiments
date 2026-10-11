import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const ALIGN_CLASSES = { start: "text-left", end: "text-right tabular-nums" } as const;

const TableHead = ({
  className,
  justify = "start",
  ...props
}: ComponentProps<"th"> & Readonly<{ justify?: keyof typeof ALIGN_CLASSES }>): ReactNode => (
  <th
    data-slot="table-head"
    className={cn(
      "h-10 px-2 align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      ALIGN_CLASSES[justify],
      className,
    )}
    {...props}
  />
);

export { TableHead };
