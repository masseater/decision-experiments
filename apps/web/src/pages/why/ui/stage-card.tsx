import type { ReactNode } from "react";

import type { Stage } from "#/pages/why/model/pipeline";
import { cn } from "#/shared/lib/utils";

const TONE: Readonly<Record<Stage["tone"], string>> = {
  plain: "bg-card",
  filter: "border-primary bg-primary text-primary-foreground font-mono",
  clean: "border-primary bg-secondary",
};

const StageCard = ({ stage }: Readonly<{ stage: Stage }>): ReactNode => (
  <li
    className={cn(
      "flex flex-col justify-center gap-1 rounded-lg border p-4 md:flex-1",
      TONE[stage.tone],
    )}
  >
    <span className="font-medium">{stage.label}</span>
    <span className="text-xs opacity-80">{stage.note}</span>
  </li>
);

export { StageCard };
