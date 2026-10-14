import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Example } from "./example";
import { Section } from "./section";

const Reason = (): ReactNode => (
  <Section title={COPY.reason.title}>
    {COPY.reason.body.map((text) => (
      <p key={text} className="leading-relaxed">
        {text}
      </p>
    ))}
    <Example />
  </Section>
);

export { Reason };
