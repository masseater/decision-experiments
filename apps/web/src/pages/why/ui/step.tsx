import { Eraser, ScanText, Split } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

type Step = "scan" | "narrow" | "remove";

const ICON: Readonly<Record<Step, LucideIcon>> = {
  scan: ScanText,
  narrow: Split,
  remove: Eraser,
};

const StepCard = ({ step }: Readonly<{ step: Step }>): ReactNode => {
  const Icon = ICON[step];
  const { head, body } = COPY.mechanism[step];
  return (
    <li className="flex flex-col gap-2 rounded-lg border p-4">
      <Icon className="text-primary size-5" />
      <span className="font-medium">{head}</span>
      <span className="text-muted-foreground text-sm">{body}</span>
    </li>
  );
};

export { StepCard };
export type { Step };
