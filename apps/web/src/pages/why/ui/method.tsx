import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Section } from "./section";

const Method = (): ReactNode => (
  <Section title={COPY.method.title}>
    <ol className="flex list-decimal flex-col gap-2 pl-5 leading-relaxed">
      {COPY.method.steps.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ol>
    <p className="leading-relaxed">{COPY.method.note}</p>
  </Section>
);

export { Method };
