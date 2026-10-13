import { Bot, Coins, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";

type Fit = "agent" | "cheap" | "weak";

const ICON_CLASS = "size-5 shrink-0";

const UseIcon = ({ fit }: Readonly<{ fit: Fit }>): ReactNode => (
  <>
    {fit === "agent" && <Bot className={ICON_CLASS} />}
    {fit === "cheap" && <Coins className={ICON_CLASS} />}
    {fit === "weak" && <MessageSquare className={ICON_CLASS} />}
  </>
);

export { UseIcon };
export type { Fit };
