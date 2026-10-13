import type { ReactNode } from "react";

import { KEPT_PERCENT } from "#/pages/why/model/cleanup";
import type { View } from "#/pages/why/model/cleanup";
import { COPY } from "#/pages/why/model/copy";
import { cn } from "#/shared/lib/utils";

import { Sentences } from "./sentences";

const Panel = ({ view, title }: Readonly<{ view: View; title: string }>): ReactNode => (
  <figure
    className={cn(
      "flex flex-col gap-3 rounded-lg border p-4",
      view === "remove" && "border-primary",
    )}
  >
    <figcaption className="flex items-baseline justify-between gap-2 text-sm font-medium">
      {title}
      <span className="text-muted-foreground font-mono text-xs">{`${COPY.cleanup.kept} ${KEPT_PERCENT[view]}%`}</span>
    </figcaption>
    <Sentences view={view} />
  </figure>
);

export { Panel };
