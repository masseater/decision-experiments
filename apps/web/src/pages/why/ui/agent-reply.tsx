import { Bot } from "lucide-react";
import type { ReactNode } from "react";

import type { View } from "#/pages/why/model/cleanup";
import { COPY } from "#/pages/why/model/copy";
import { cn } from "#/shared/lib/utils";

const REPLY: Readonly<Record<View, string>> = {
  raw: COPY.compare.replyRaw,
  cleaned: COPY.compare.replyCleaned,
};

const AgentReply = ({ view }: Readonly<{ view: View }>): ReactNode => (
  <figure className="bg-muted flex flex-col gap-1 rounded-md p-3 text-sm">
    <figcaption className="text-muted-foreground flex items-center gap-1 text-xs">
      <Bot className="size-4" />
      {COPY.compare.reply}
    </figcaption>
    <p className={cn(view === "raw" && "text-destructive font-medium")}>{REPLY[view]}</p>
  </figure>
);

export { AgentReply };
