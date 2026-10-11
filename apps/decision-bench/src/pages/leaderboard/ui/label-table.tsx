import type { ReactNode } from "react";

import type { LabelStats } from "#/pages/leaderboard/model/summary";

import { HeaderRow } from "./header-row";
import { LabelRow } from "./label-row";

const HEADERS = ["タスク", "件数", "hard", "Opus 5.5 のラベル費用", "Opus 5.5 と人の正解の一致率"];

const LabelTable = ({ labeling }: Readonly<{ labeling: readonly LabelStats[] }>): ReactNode => (
  <table className="w-full text-sm">
    <thead>
      <HeaderRow headers={HEADERS} />
    </thead>
    <tbody>
      {labeling.map((stats) => (
        <LabelRow key={stats.task} stats={stats} />
      ))}
    </tbody>
  </table>
);

export { LabelTable };
