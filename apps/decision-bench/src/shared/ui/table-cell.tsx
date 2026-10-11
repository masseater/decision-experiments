import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const TableCell = ({ className, ...props }: ComponentProps<"td">): ReactNode => (
  <td
    data-slot="table-cell"
    className={cn(
      "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      className,
    )}
    {...props}
  />
);

export { TableCell };
