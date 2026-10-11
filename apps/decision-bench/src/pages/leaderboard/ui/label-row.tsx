import type { ReactNode } from "react";

import type { LabelStats } from "#/pages/leaderboard/model/summary";

import { percent, usd } from "./format";

const humanMatch = (stats: Readonly<LabelStats>): string => {
  if ("opusMatchesHuman" in stats) {
    return `${percent(stats.opusMatchesHuman)}%`;
  }
  return "-";
};

const LabelRow = ({ stats }: Readonly<{ stats: LabelStats }>): ReactNode => (
  <tr className="border-t">
    <td className="py-2 pr-4 font-medium">{stats.task}</td>
    <td className="py-2 pr-4 text-right">{stats.items}</td>
    <td className="py-2 pr-4 text-right">{stats.hard}</td>
    <td className="py-2 pr-4 text-right">{usd(stats.opusCostUsd)}</td>
    <td className="py-2 text-right">{humanMatch(stats)}</td>
  </tr>
);

export { LabelRow };
