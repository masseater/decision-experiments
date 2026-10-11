import type { ReactNode } from "react";

import type { TaskResult } from "#/pages/leaderboard/model/summary";
import { TableCell } from "#/shared/ui/table-cell";
import { TableHead } from "#/shared/ui/table-head";
import { TableRow } from "#/shared/ui/table-row";

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
    <TableRow>
      <TableHead scope="row">{label}</TableHead>
      <TableCell justify="end">{ece}</TableCell>
      <TableCell justify="end">{brier}</TableCell>
      <TableCell justify="end">{`${result.p50Ms} / ${result.p95Ms}`}</TableCell>
      <TableCell justify="end">{usd(result.costPer1000Usd)}</TableCell>
    </TableRow>
  );
};

export { ProfileRow };
