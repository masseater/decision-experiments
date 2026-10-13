import { ArrowDown, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const Arrow = (): ReactNode => (
  <li aria-hidden="true" className="text-muted-foreground flex justify-center self-center">
    <ArrowRight className="hidden size-5 md:block" />
    <ArrowDown className="size-5 md:hidden" />
  </li>
);

export { Arrow };
