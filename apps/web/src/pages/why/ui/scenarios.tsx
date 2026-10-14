import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Scenario } from "./scenario";
import type { Case } from "./scenario";
import { Section } from "./section";

const CASES: readonly Case[] = ["web", "mail", "code", "rag"];

const Scenarios = (): ReactNode => (
  <Section title={COPY.scenarios.title}>
    <ul className="grid gap-3 md:grid-cols-2">
      {CASES.map((kind) => (
        <Scenario key={kind} kind={kind} />
      ))}
    </ul>
  </Section>
);

export { Scenarios };
