import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const Table = ({ className, ...props }: ComponentProps<"table">): ReactNode => (
  <div data-slot="table-container" className="relative w-full overflow-x-auto">
    <table
      data-slot="table"
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
);

export { Table };
