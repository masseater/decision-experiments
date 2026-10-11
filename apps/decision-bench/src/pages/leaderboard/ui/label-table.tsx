import type { ReactNode } from "react";

import type { LabelStats } from "#/pages/leaderboard/model/summary";

import { HeaderRow } from "./header-row";
import { LabelRow } from "./label-row";

const HEADERS = ["タスク", "件数", "hard", "Opus 5.5 のラベル費用", "Opus 5.5 と人の正解の一致率"];

const LabelTable = ({
  labeling,
  labelledBy,
}: Readonly<{ labeling: readonly LabelStats[]; labelledBy: string }>): ReactNode => (
  <table aria-labelledby={labelledBy} className="w-full text-xs sm:text-sm">
    <thead>
      <HeaderRow headers={HEADERS} align="end" />
    </thead>
    <tbody>
      {labeling.map((stats) => (
        <LabelRow key={stats.task} stats={stats} />
      ))}
    </tbody>
  </table>
);

export { LabelTable };
