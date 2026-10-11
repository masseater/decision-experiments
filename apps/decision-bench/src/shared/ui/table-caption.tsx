import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const TableCaption = ({ className, ...props }: ComponentProps<"caption">): ReactNode => (
  <caption
    data-slot="table-caption"
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
);

export { TableCaption };
