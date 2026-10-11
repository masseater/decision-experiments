import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";

import { ReliabilityChart } from "./reliability-chart";

const TITLE = "確信度と実際の正解率";
const HINT = "対角線より下は過信";

const ReliabilityFigure = ({ entry }: Readonly<{ entry: TaskEntry }>): ReactNode => {
  const title = `${TITLE}（${displayLabel(entry)}）`;
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-col text-sm font-medium">
        {title}
        <span className="text-muted-foreground text-xs font-normal">{HINT}</span>
      </figcaption>
      <ReliabilityChart title={title} result={entry.result} />
    </figure>
  );
};

export { ReliabilityFigure };
