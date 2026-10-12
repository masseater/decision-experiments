import type { Detection } from "@injection-bisect/core";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { formatPercent } from "#/pages/inspect/model/format";
import { cn } from "#/shared/lib/utils";

const labelOf = (status: Detection["status"]): string => {
  if (status === "clean") {
    return COPY.clean;
  }
  return COPY.injected;
};

const Verdict = ({
  status,
  probability,
}: Readonly<{ status: Detection["status"]; probability: number }>): ReactNode => (
  <h2 className={cn("text-lg font-semibold", status === "injected" && "text-destructive")}>
    {labelOf(status)}
    {COPY.separator}
    {formatPercent(probability)}
  </h2>
);

export { Verdict };
