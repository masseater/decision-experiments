import { Bot, Eraser, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

type Node = "source" | "bisect" | "agent";

const LOOK: Readonly<Record<Node, Readonly<{ icon: LucideIcon; border: string }>>> = {
  source: { icon: FileText, border: "" },
  bisect: { icon: Eraser, border: "border-primary border-2" },
  agent: { icon: Bot, border: "" },
};

const FlowNode = ({ node }: Readonly<{ node: Node }>): ReactNode => {
  const { icon: Icon, border } = LOOK[node];
  const { label, note } = COPY.flow[node];
  return (
    <li className={`flex flex-1 flex-col gap-1 rounded-lg border p-4 ${border}`}>
      <Icon className="text-primary size-5" />
      <span className="font-semibold">{label}</span>
      <span className="text-muted-foreground text-sm">{note}</span>
    </li>
  );
};

export { FlowNode };
export type { Node };
