import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";
import type { TaskInfo } from "#/pages/leaderboard/model/ranking";

import { HeaderRow } from "./header-row";
import { ProfileRow } from "./profile-row";

const CAPTION = "確信度・速度・費用";
const HEADERS = ["モデル", "ECE", "Brier", "p50 / p95 ms", "1,000 件あたり"];

const ProfileTable = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => (
  <table className="w-full text-xs sm:text-sm">
    <caption className="pb-2 text-left text-sm font-medium">{CAPTION}</caption>
    <thead>
      <HeaderRow headers={HEADERS} align="end" />
    </thead>
    <tbody>
      {entriesOf(task.task)
        .filter(({ result }) => result.support === "supported")
        .map((entry) => (
          <ProfileRow key={entry.model.model} label={displayLabel(entry)} result={entry.result} />
        ))}
    </tbody>
  </table>
);

export { ProfileTable };
