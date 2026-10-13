import type { ReactNode } from "react";

import { BENCH } from "#/pages/why/model/bench";

import { BenchLine } from "./bench-line";

const BenchBody = (): ReactNode => (
  <tbody>
    {BENCH.map((row) => (
      <BenchLine key={row.model} row={row} />
    ))}
  </tbody>
);

export { BenchBody };
