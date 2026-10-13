import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { BenchTable } from "./bench-table";

const BenchDetails = (): ReactNode => (
  <details className="rounded-lg border px-4 py-3">
    <summary className="cursor-pointer text-sm font-medium">{COPY.bench.title}</summary>
    <div className="mt-3">
      <BenchTable />
    </div>
  </details>
);

export { BenchDetails };
