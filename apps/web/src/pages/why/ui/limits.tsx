import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { LimitLine } from "./limit-line";
import { Section } from "./section";

const Limits = (): ReactNode => (
  <Section title={COPY.limits.title}>
    {COPY.limits.items.map((text) => (
      <LimitLine key={text} text={text} />
    ))}
  </Section>
);

export { Limits };
