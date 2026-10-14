import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Limit } from "./limit";
import { Section } from "./section";

const LIMITS = [COPY.limits.structure, COPY.limits.diluted] as const;

const Limits = (): ReactNode => (
  <Section title={COPY.limits.title}>
    <ul className="flex flex-col gap-2">
      {LIMITS.map((text) => (
        <Limit key={text} text={text} />
      ))}
    </ul>
  </Section>
);

export { Limits };
