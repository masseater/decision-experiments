import type { ReactNode } from "react";

import { FlowArrow } from "./flow-arrow";
import { FlowNode } from "./flow-node";

const Flow = (): ReactNode => (
  <ol className="flex flex-col items-stretch gap-2 md:flex-row">
    <FlowNode node="source" />
    <FlowArrow />
    <FlowNode node="bisect" />
    <FlowArrow />
    <FlowNode node="agent" />
  </ol>
);

export { Flow };
