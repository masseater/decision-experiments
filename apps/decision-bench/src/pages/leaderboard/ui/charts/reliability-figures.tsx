import type { ReactNode } from "react";

import { entriesOf } from "#/pages/leaderboard/model/ranking";

import { ReliabilityFigure } from "./reliability-figure";

const ReliabilityFigures = ({ task }: Readonly<{ task: string }>): ReactNode => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {entriesOf(task)
      .filter(({ result }) => result.test.calibration.status === "measured")
      .map((entry) => (
        <ReliabilityFigure key={entry.model.model} entry={entry} />
      ))}
  </div>
);

export { ReliabilityFigures };
