import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { JudgeFlow } from "./judge-flow";
import { Section } from "./section";

const Hijack = (): ReactNode => (
  <Section title={COPY.hijack.title}>
    <div className="grid gap-4 md:grid-cols-2">
      <JudgeFlow
        name={COPY.hijack.chat}
        output={COPY.hijack.chatOut}
        risk={COPY.hijack.chatRisk}
        safe="no"
      />
      <JudgeFlow
        name={COPY.hijack.decision}
        output={COPY.hijack.decisionOut}
        risk={COPY.hijack.decisionSafe}
        safe="yes"
      />
    </div>
  </Section>
);

export { Hijack };
