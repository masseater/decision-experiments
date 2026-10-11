import type { ReactNode } from "react";

import type { ModelResult } from "#/pages/leaderboard/model/summary";

import { HeaderRow } from "./header-row";
import { TaskRow } from "./task-row";

const HEADERS = [
  "モデル",
  "指数",
  "タスク",
  "skill（test）",
  "raw（test）",
  "失敗",
  "p50 / p95 (ms)",
  "1,000 判定あたり",
];

const ModelTable = ({
  models,
  labelledBy,
}: Readonly<{ models: readonly ModelResult[]; labelledBy: string }>): ReactNode => (
  <table aria-labelledby={labelledBy} className="w-full text-sm">
    <thead>
      <HeaderRow headers={HEADERS} />
    </thead>
    <tbody>
      {models.flatMap((model) =>
        model.tasks.map((task) => (
          <TaskRow key={`${model.model}-${task.task}`} model={model} task={task} />
        )),
      )}
    </tbody>
  </table>
);

export { ModelTable };
