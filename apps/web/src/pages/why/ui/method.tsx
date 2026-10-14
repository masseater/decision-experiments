import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Line } from "./line";
import { Section } from "./section";

const Method = (): ReactNode => (
  <Section title={COPY.method.title}>
    <ol className="flex list-decimal flex-col gap-2 pl-5 leading-relaxed">
      {COPY.method.steps.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ol>
    <Line text={COPY.method.note}>
      <Lock />
    </Line>
  </Section>
);

export { Method };
