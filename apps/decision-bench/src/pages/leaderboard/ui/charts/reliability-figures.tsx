import type { ReactNode } from "react";

import type { TaskEntry } from "#/pages/leaderboard/model/ranking";

import { ReliabilityFigure } from "./reliability-figure";

const ReliabilityFigures = ({
  entries,
}: Readonly<{ entries: readonly TaskEntry[] }>): ReactNode => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {entries
      .filter(({ result }) => result.test.calibration.status === "measured")
      .map((entry) => (
        <ReliabilityFigure key={entry.model.model} entry={entry} />
      ))}
  </div>
);

export { ReliabilityFigures };
