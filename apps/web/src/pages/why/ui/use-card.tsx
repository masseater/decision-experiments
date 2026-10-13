import type { ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

import { UseIcon } from "./use-icon";
import type { Fit } from "./use-icon";

const UseCard = ({ text, fit }: Readonly<{ text: string; fit: Fit }>): ReactNode => (
  <li
    className={cn(
      "flex items-start gap-3 rounded-lg border p-4 text-sm",
      fit === "weak" && "text-muted-foreground border-dashed",
    )}
  >
    <UseIcon fit={fit} />
    {text}
  </li>
);

export { UseCard };
