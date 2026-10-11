import { summary } from "./summary";
import type { ModelResult, TaskResult } from "./summary";

type TaskEntry = Readonly<{ model: ModelResult; result: TaskResult }>;

const NO_LATENCY = 0;

const rankedModels: readonly ModelResult[] = summary.models.toSorted(
  (left, right) => right.index - left.index || left.label.localeCompare(right.label),
);

const tasks: readonly Pick<TaskResult, "task" | "label">[] = [
  ...new Map(
    summary.models.flatMap((model) =>
      model.tasks.map(({ task, label }) => [task, { task, label }] as const),
    ),
  ).values(),
];

const entriesOf = (task: string): readonly TaskEntry[] =>
  rankedModels.flatMap((model) =>
    model.tasks.filter((result) => result.task === task).map((result) => ({ model, result })),
  );

const slowestP50 = Math.max(
  NO_LATENCY,
  ...summary.models.flatMap((model) =>
    model.tasks.filter(({ support }) => support === "supported").map(({ p50Ms }) => p50Ms),
  ),
);

export { entriesOf, rankedModels, slowestP50, tasks };
