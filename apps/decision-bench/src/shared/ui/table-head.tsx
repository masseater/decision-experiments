import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const TableHead = ({ className, ...props }: ComponentProps<"th">): ReactNode => (
  <th
    data-slot="table-head"
    className={cn(
      "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      className,
    )}
    {...props}
  />
);

export { TableHead };
