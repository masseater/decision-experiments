import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { ResultsTable } from "./results-table";
import { Section } from "./section";

const Results = (): ReactNode => (
  <Section title={COPY.results.title}>
    <ResultsTable />
    <p className="text-muted-foreground text-xs">{COPY.results.caption}</p>
  </Section>
);

export { Results };
