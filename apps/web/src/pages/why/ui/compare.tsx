import type { ReactNode } from "react";

import { CompareCard } from "./compare-card";

const Compare = (): ReactNode => (
  <div className="grid gap-4 md:grid-cols-2">
    <CompareCard view="raw" />
    <CompareCard view="cleaned" />
  </div>
);

export { Compare };
