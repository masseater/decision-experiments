import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";

import { ReliabilityChart } from "./reliability-chart";

const TITLE = "確信度と実際の正解率";

const ReliabilityFigure = ({ entry }: Readonly<{ entry: TaskEntry }>): ReactNode => {
  const label = displayLabel(entry);
  const title = `${TITLE}（${label}）`;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm font-medium">{label}</figcaption>
      <ReliabilityChart title={title} result={entry.result} />
    </figure>
  );
};

export { ReliabilityFigure };
