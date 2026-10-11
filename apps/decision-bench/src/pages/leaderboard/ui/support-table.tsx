import type { ReactNode } from "react";

import { rankedModels, tasks } from "#/pages/leaderboard/model/ranking";

import { HeaderRow } from "./header-row";
import { SupportRow } from "./support-row";

const HEADERS = ["モデル", ...tasks.map((task) => task.label)];

const SupportTable = (): ReactNode => (
  <table aria-labelledby="support" className="w-full text-xs sm:text-sm">
    <thead>
      <HeaderRow headers={HEADERS} align="start" />
    </thead>
    <tbody>
      {rankedModels.map((model) => (
        <SupportRow key={model.model} model={model} />
      ))}
    </tbody>
  </table>
);

export { SupportTable };
