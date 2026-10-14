import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { CompareCard } from "./compare-card";
import { Section } from "./section";

const Compare = (): ReactNode => (
  <Section title={COPY.compare.title}>
    <div className="grid gap-4 md:grid-cols-2">
      <CompareCard view="raw" />
      <CompareCard view="cleaned" />
    </div>
  </Section>
);

export { Compare };
