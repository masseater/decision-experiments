import type { ReactNode } from "react";

import { percent } from "./format";

const Bar = ({ ratio }: Readonly<{ ratio: number }>): ReactNode => (
  <svg className="h-3 min-w-0 flex-1" aria-hidden="true">
    <rect className="fill-muted" width="100%" height="100%" rx="4" />
    <rect className="fill-chart-bar" width={`${percent(ratio)}%`} height="100%" rx="4" />
  </svg>
);

export { Bar };
