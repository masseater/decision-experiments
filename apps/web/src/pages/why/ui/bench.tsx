import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { BenchTable } from "./bench-table";
import { Section } from "./section";

const Bench = (): ReactNode => (
  <Section title={COPY.bench.title}>
    <BenchTable />
  </Section>
);

export { Bench };
