import type { ReactNode } from "react";

import { ROWS } from "#/pages/why/model/results";

import { ResultsRow } from "./results-row";

const ResultsBody = (): ReactNode => (
  <tbody>
    {ROWS.map((row) => (
      <ResultsRow key={row.label} row={row} />
    ))}
  </tbody>
);

export { ResultsBody };
