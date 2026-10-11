import type { ReactNode } from "react";

import type { TaskResult } from "#/pages/leaderboard/model/summary";

import { failureRate, percent, usd } from "./format";

const DetailRow = ({
  label,
  result,
}: Readonly<{ label: string; result: TaskResult }>): ReactNode => (
  <tr className="border-t tabular-nums">
    <th scope="row" className="py-2 pr-3 text-left font-medium">
      {label}
    </th>
    <td className="py-2 pr-3 text-right">{percent(result.test.skill)}</td>
    <td className="py-2 pr-3 text-right">{percent(result.test.raw)}</td>
    <td className="py-2 pr-3 text-right">{failureRate(result.test)}</td>
    <td className="py-2 pr-3 text-right">{`${result.p50Ms} / ${result.p95Ms}`}</td>
    <td className="py-2 text-right">{usd(result.costPer1000Usd)}</td>
  </tr>
);

export { DetailRow };
