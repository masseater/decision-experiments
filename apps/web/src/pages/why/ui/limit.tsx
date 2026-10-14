import { Info } from "lucide-react";
import type { ReactNode } from "react";

const Limit = ({ text }: Readonly<{ text: string }>): ReactNode => (
  <li className="flex items-start gap-2 text-sm">
    <Info className="text-muted-foreground mt-0.5 size-4 shrink-0" />
    {text}
  </li>
);

export { Limit };
