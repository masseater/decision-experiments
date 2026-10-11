import type { ReactNode } from "react";

import type { ModelResult, TaskResult } from "#/pages/leaderboard/model/summary";

import { percent, usd } from "./format";

const TaskRow = ({
  model,
  task,
}: Readonly<{ model: ModelResult; task: TaskResult }>): ReactNode => (
  <tr className="border-t">
    <td className="py-2 pr-4 font-medium">{model.label}</td>
    <td className="py-2 pr-4 text-right">{percent(model.index)}</td>
    <td className="py-2 pr-4">{task.label}</td>
    <td className="py-2 pr-4 text-right">{percent(task.test.skill)}</td>
    <td className="py-2 pr-4 text-right">{percent(task.test.raw)}</td>
    <td className="py-2 pr-4 text-right">{`${task.test.failed}/${task.test.total}`}</td>
    <td className="py-2 pr-4 text-right">{`${task.p50Ms} / ${task.p95Ms}`}</td>
    <td className="py-2 text-right">{usd(task.costPer1000Usd)}</td>
  </tr>
);

export { TaskRow };
