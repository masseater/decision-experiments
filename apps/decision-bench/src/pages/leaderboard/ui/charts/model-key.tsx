import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import type { TaskEntry } from "#/pages/leaderboard/model/ranking";

const ModelKey = ({ entries }: Readonly<{ entries: readonly TaskEntry[] }>): ReactNode => (
  <ol className="text-muted-foreground grid grid-cols-2 content-start gap-x-4 gap-y-1 self-start text-xs">
    {entries.map((entry) => (
      <li key={entry.model.model} className="flex gap-1.5">
        <span className="text-foreground w-5 text-right tabular-nums">{entry.mark}</span>
        {displayLabel(entry)}
      </li>
    ))}
  </ol>
);

export { ModelKey };
