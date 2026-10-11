import type { ReactNode } from "react";

import type { ModelResult, TaskResult } from "#/pages/leaderboard/model/summary";

import { failureRate } from "./format";

const UNSUPPORTED = "未対応";

const SPLIT = "Noul 分割・";

const supportText = (model: Readonly<ModelResult>, result: Readonly<TaskResult>): string => {
  if (result.support === "unsupported") {
    return UNSUPPORTED;
  }
  if (model.choiceVia === "noul" && result.format === "choice") {
    return `${SPLIT}失敗 ${failureRate(result.test)}`;
  }
  return `失敗 ${failureRate(result.test)}`;
};

const SupportRow = ({ model }: Readonly<{ model: ModelResult }>): ReactNode => (
  <tr className="border-t">
    <th scope="row" className="py-2 pr-3 text-left font-medium">
      {model.label}
    </th>
    {model.tasks.map((result) => (
      <td key={result.task} className="py-2 pr-3 tabular-nums">
        {supportText(model, result)}
      </td>
    ))}
  </tr>
);

export { SupportRow };
