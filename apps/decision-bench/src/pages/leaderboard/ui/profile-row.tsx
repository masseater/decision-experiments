import type { ReactNode } from "react";

import type { TaskResult } from "#/pages/leaderboard/model/summary";

import { decimal, usd } from "./format";

const NOT_AVAILABLE = "-";

const calibrationCells = (result: Readonly<TaskResult>): readonly [string, string] => {
  if (result.test.calibration.status === "unavailable") {
    return [NOT_AVAILABLE, NOT_AVAILABLE];
  }
  return [decimal(result.test.calibration.ece), decimal(result.test.calibration.brier)];
};

const ProfileRow = ({
  label,
  result,
}: Readonly<{ label: string; result: TaskResult }>): ReactNode => {
  const [ece, brier] = calibrationCells(result);
  return (
    <tr className="border-t tabular-nums">
      <th scope="row" className="py-2 pr-3 text-left font-medium">
        {label}
      </th>
      <td className="py-2 pr-3 text-right">{ece}</td>
      <td className="py-2 pr-3 text-right">{brier}</td>
      <td className="py-2 pr-3 text-right">{`${result.p50Ms} / ${result.p95Ms}`}</td>
      <td className="py-2 text-right">{usd(result.costPer1000Usd)}</td>
    </tr>
  );
};

export { ProfileRow };
