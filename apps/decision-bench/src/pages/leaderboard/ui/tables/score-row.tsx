import type { ReactNode } from "react";

import type { TaskResult } from "#/pages/leaderboard/model/summary";
import { percent } from "#/pages/leaderboard/ui/format";
import { TableCell } from "#/shared/ui/table-cell";
import { TableHead } from "#/shared/ui/table-head";
import { TableRow } from "#/shared/ui/table-row";

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
      <TableCell className="text-right tabular-nums">{percent(result.test.skill)}</TableCell>
      <TableCell className="text-right tabular-nums">{percent(result.test.raw)}</TableCell>
      <TableCell className="text-right tabular-nums">{percent(result.test.accuracy)}</TableCell>
      <TableCell className="text-right tabular-nums">{`${percent(result.test.coverage)}%`}</TableCell>
    </TableRow>
  );
};

export { ScoreRow };
