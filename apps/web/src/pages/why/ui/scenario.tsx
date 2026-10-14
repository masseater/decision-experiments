import { FileSearch, Globe, Mail, SquareCode } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

type Case = "web" | "mail" | "code" | "rag";

const ICON: Readonly<Record<Case, LucideIcon>> = {
  web: Globe,
  mail: Mail,
  code: SquareCode,
  rag: FileSearch,
};

const Scenario = ({ kind }: Readonly<{ kind: Case }>): ReactNode => {
  const Icon = ICON[kind];
  const { who, when } = COPY.scenarios[kind];
  return (
    <li className="flex items-start gap-3 rounded-lg border p-4">
      <Icon className="text-primary mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        <span className="font-medium">{who}</span>
        <span className="text-muted-foreground text-sm">{when}</span>
      </div>
    </li>
  );
};

export { Scenario };
export type { Case };
