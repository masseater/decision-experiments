import type { Detection } from "@injection-bisect/core";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import {
  formatDollars,
  formatMillis,
  formatPercent,
  totalCost,
} from "#/pages/inspect/model/format";
import { cn } from "#/shared/lib/utils";

import { StepBar } from "./step-bar";

const labelOf = (status: Detection["status"]): string => {
  if (status === "clean") {
    return COPY.clean;
  }
  return COPY.injected;
};

const InspectResult = ({
  detection,
}: Readonly<{ detection: Detection & { readonly millis: number } }>): ReactNode => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <h2
        className={cn(
          "text-lg font-semibold",
          detection.status === "injected" && "text-destructive",
        )}
      >
        {labelOf(detection.status)}
      </h2>
      <span className="font-mono text-sm">{formatPercent(detection.probability)}</span>
      <span className="text-muted-foreground text-sm">
        {detection.probes.length}
        {COPY.times}
      </span>
      <span className="text-muted-foreground text-sm">{formatMillis(detection.millis)}</span>
      <span className="text-muted-foreground text-sm">
        {formatDollars(totalCost(detection.probes))}
      </span>
    </div>
    <StepBar probes={detection.probes} />
  </div>
);

export { InspectResult };
