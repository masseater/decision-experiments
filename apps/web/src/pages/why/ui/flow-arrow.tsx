import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const FlowArrow = (): ReactNode => (
  <li aria-hidden className="text-muted-foreground flex justify-center self-center">
    <ArrowRight className="size-5 rotate-90 md:rotate-0" />
  </li>
);

export { FlowArrow };
