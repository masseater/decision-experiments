import type { ReactNode } from "react";

import type { Line } from "#/pages/extract/model/result";

import { ResultRow } from "./result-row";

const ResultRows = ({ lines }: Readonly<{ lines: readonly Line[] }>): ReactNode => (
  <tbody>
    {lines.map(({ label, value }) => (
      <ResultRow key={label} label={label} value={value} />
    ))}
  </tbody>
);

export { ResultRows };
