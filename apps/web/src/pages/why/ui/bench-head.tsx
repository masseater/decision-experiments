import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

const HEADERS = [
  COPY.bench.model,
  COPY.bench.missed,
  COPY.bench.falseAlarms,
  COPY.bench.located,
  COPY.bench.extra,
] as const;

const BenchHead = (): ReactNode => (
  <thead className="text-muted-foreground text-xs">
    <tr>
      {HEADERS.map((header) => (
        <th key={header} className="px-2 py-1 text-left font-normal">
          {header}
        </th>
      ))}
    </tr>
  </thead>
);

export { BenchHead };
