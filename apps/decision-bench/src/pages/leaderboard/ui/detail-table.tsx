import type { ReactNode } from "react";

import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";

import { DetailRow } from "./detail-row";
import { HeaderRow } from "./header-row";

const HEADERS = ["モデル", "skill", "raw", "失敗率", "p50 / p95 ms", "1,000 件あたり"];

const DetailTable = ({ task, label }: Readonly<{ task: string; label: string }>): ReactNode => (
  <table className="w-full text-xs sm:text-sm">
    <caption className="pb-2 text-left text-sm font-medium">{label}</caption>
    <thead>
      <HeaderRow headers={HEADERS} align="end" />
    </thead>
    <tbody>
      {entriesOf(task).map(({ model, result }) => (
        <DetailRow key={model.model} label={displayLabel({ model, result })} result={result} />
      ))}
    </tbody>
  </table>
);

export { DetailTable };
