import type { ReactNode } from "react";

import type { TaskResult } from "#/pages/leaderboard/model/summary";
import { TableCell } from "#/shared/ui/table-cell";
import { TableHead } from "#/shared/ui/table-head";
import { TableRow } from "#/shared/ui/table-row";

import { percent } from "./format";

const UNSUPPORTED = "未対応";
const SCORE_COLUMNS = 4;

const ScoreRow = ({
  label,
  result,
}: Readonly<{ label: string; result: TaskResult }>): ReactNode => {
  if (result.support === "unsupported") {
    return (
      <TableRow>
        <TableHead scope="row">{label}</TableHead>
        <TableCell colSpan={SCORE_COLUMNS}>{UNSUPPORTED}</TableCell>
      </TableRow>
    );
  }
  return (
    <TableRow>
      <TableHead scope="row">{label}</TableHead>
      <TableCell justify="end">{percent(result.test.skill)}</TableCell>
      <TableCell justify="end">{percent(result.test.raw)}</TableCell>
      <TableCell justify="end">{percent(result.test.accuracy)}</TableCell>
      <TableCell justify="end">{`${percent(result.test.coverage)}%`}</TableCell>
    </TableRow>
  );
};

export { ScoreRow };
