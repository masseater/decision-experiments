import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Section } from "./section";
import { StepCard } from "./step";
import type { Step } from "./step";

const STEPS: readonly Step[] = ["scan", "narrow", "remove"];

const Mechanism = (): ReactNode => (
  <Section title={COPY.mechanism.title}>
    <ol className="grid gap-3 md:grid-cols-3">
      {STEPS.map((step) => (
        <StepCard key={step} step={step} />
      ))}
    </ol>
  </Section>
);

export { Mechanism };
