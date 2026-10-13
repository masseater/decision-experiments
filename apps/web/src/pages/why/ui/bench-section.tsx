import type { ReactNode } from "react";

import { BENCH } from "#/pages/why/model/bench";
import type { BenchRow } from "#/pages/why/model/bench";
import { COPY } from "#/pages/why/model/copy";

import { BarChart } from "./bar-chart";
import { BenchTable } from "./bench-table";
import { Section } from "./section";

const MS = "ms";

const COST_DIGITS = 2;

const msOf = ({ medianMs }: BenchRow): string => `${medianMs.toLocaleString("ja-JP")}${MS}`;

const dollarsOf = ({ dollarsPerText }: BenchRow): string =>
  `$${dollarsPerText.toLocaleString("en-US", { maximumSignificantDigits: COST_DIGITS })}`;

const timeOf = ({ medianMs }: BenchRow): number => medianMs;

const costOf = ({ dollarsPerText }: BenchRow): number => dollarsPerText;

const BenchSection = (): ReactNode => (
  <Section title={COPY.bench.title}>
    <p className="text-muted-foreground text-xs">{COPY.bench.caption}</p>
    <BenchTable />
    <div className="grid gap-8">
      <BarChart title={COPY.bench.time} rows={BENCH} valueOf={timeOf} textOf={msOf} />
      <BarChart title={COPY.bench.cost} rows={BENCH} valueOf={costOf} textOf={dollarsOf} />
    </div>
    <p className="text-sm">{COPY.bench.note}</p>
    <p className="text-muted-foreground text-xs">{COPY.bench.agentNote}</p>
  </Section>
);

export { BenchSection };
