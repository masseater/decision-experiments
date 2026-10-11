import type { ReactNode } from "react";

import type { TaskResult } from "#/pages/leaderboard/model/summary";

import { percent } from "./format";

const UNSUPPORTED = "未対応";

const ScoreRow = ({
  label,
  result,
}: Readonly<{ label: string; result: TaskResult }>): ReactNode => {
  if (result.support === "unsupported") {
    return (
      <tr className="border-t">
        <th scope="row" className="py-2 pr-3 text-left font-medium">
          {label}
        </th>
        <td colSpan={4} className="text-muted-foreground py-2">
          {UNSUPPORTED}
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-t tabular-nums">
      <th scope="row" className="py-2 pr-3 text-left font-medium">
        {label}
      </th>
      <td className="py-2 pr-3 text-right">{percent(result.test.skill)}</td>
      <td className="py-2 pr-3 text-right">{percent(result.test.raw)}</td>
      <td className="py-2 pr-3 text-right">{percent(result.test.accuracy)}</td>
      <td className="py-2 text-right">{`${percent(result.test.coverage)}%`}</td>
    </tr>
  );
};

export { ScoreRow };
