import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

import { Risk } from "./risk";

const JudgeFlow = ({
  name,
  output,
  risk,
  safe,
}: Readonly<{ name: string; output: string; risk: string; safe: "yes" | "no" }>): ReactNode => (
  <div
    className={cn("flex flex-col gap-3 rounded-lg border p-4", safe === "yes" && "border-primary")}
  >
    <p className="flex items-center gap-2 text-sm">
      <span className="font-medium">{name}</span>
      <ArrowRight className="text-muted-foreground size-4" />
      <span className="bg-muted rounded-md px-2 py-0.5 font-mono">{output}</span>
    </p>
    <Risk text={risk} safe={safe} />
  </div>
);

export { JudgeFlow };
