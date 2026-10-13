import type { ReactNode } from "react";

import type { BenchRow } from "#/pages/why/model/bench";

import { Bar } from "./bar";

const BarChart = ({
  title,
  rows,
  valueOf,
  textOf,
}: Readonly<{
  title: string;
  rows: readonly BenchRow[];
  valueOf: (row: BenchRow) => number;
  textOf: (row: BenchRow) => string;
}>): ReactNode => {
  const max = Math.max(...rows.map((row) => valueOf(row)));
  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="text-sm font-medium">{title}</figcaption>
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <Bar
            key={row.model}
            label={row.model}
            value={valueOf(row)}
            max={max}
            text={textOf(row)}
            tone="neutral"
          />
        ))}
      </dl>
    </figure>
  );
};

export { BarChart };
