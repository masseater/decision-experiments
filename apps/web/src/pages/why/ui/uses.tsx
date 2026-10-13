import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Section } from "./section";
import { UseCard } from "./use-card";

const Uses = (): ReactNode => (
  <Section title={COPY.uses.title}>
    <ul className="grid gap-4 md:grid-cols-3">
      <UseCard text={COPY.uses.agent} fit="agent" />
      <UseCard text={COPY.uses.cheap} fit="cheap" />
      <UseCard text={COPY.uses.weak} fit="weak" />
    </ul>
  </Section>
);

export { Uses };
