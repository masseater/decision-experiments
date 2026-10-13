import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { View } from "#/pages/why/model/cleanup";
import { COPY } from "#/pages/why/model/copy";

import { AgentReply } from "./agent-reply";
import { Sentences } from "./sentences";

const LOOK: Readonly<Record<View, Readonly<{ title: string; border: string; icon: LucideIcon }>>> =
  {
    raw: { title: COPY.compare.raw, border: "border-destructive/50", icon: ShieldAlert },
    cleaned: { title: COPY.compare.cleaned, border: "border-primary", icon: ShieldCheck },
  };

const CompareCard = ({ view }: Readonly<{ view: View }>): ReactNode => {
  const { title, border, icon: Icon } = LOOK[view];
  return (
    <section className={`flex flex-col gap-4 rounded-lg border p-5 ${border}`}>
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="size-5" />
        {title}
      </h2>
      <Sentences view={view} />
      <AgentReply view={view} />
    </section>
  );
};

export { CompareCard };
