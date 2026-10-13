import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

const Risk = ({ text, safe }: Readonly<{ text: string; safe: "yes" | "no" }>): ReactNode => (
  <p className={cn("flex items-center gap-2 text-xs", safe === "no" && "text-destructive")}>
    {safe === "yes" && <ShieldCheck className="size-4" />}
    {safe === "no" && <ShieldAlert className="size-4" />}
    {text}
  </p>
);

export { Risk };
