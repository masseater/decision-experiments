import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Section } from "./section";

const Limits = (): ReactNode => (
  <Section title={COPY.limits.title}>
    <ul className="flex list-disc flex-col gap-2 pl-5 leading-relaxed">
      {COPY.limits.items.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ul>
  </Section>
);

export { Limits };
