import { cn } from "@decision-experiments/web-ui";
import type { ComponentProps, ReactNode } from "react";

const TableHeader = ({ className, ...props }: ComponentProps<"thead">): ReactNode => (
  <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
);

export { TableHeader };
