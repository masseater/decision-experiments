import { summary } from "./summary";
import type { ModelResult, TaskResult } from "./summary";

type TaskEntry = Readonly<{ model: ModelResult; result: TaskResult }>;

const rankedModels: readonly ModelResult[] = summary.models.toSorted(
  (left, right) => right.index - left.index || left.label.localeCompare(right.label),
);

type TaskInfo = Readonly<
  Pick<TaskResult, "task" | "label" | "format" | "metric"> & { test: number; hard: number }
>;

const tasks: readonly TaskInfo[] = [
  ...new Map(
    summary.models.flatMap((model) =>
      model.tasks.map(
        (result) =>
          [
            result.task,
            {
              task: result.task,
              label: result.label,
              format: result.format,
              metric: result.metric,
              test: result.test.total,
              hard: result.hard.total,
            },
          ] as const,
      ),
    ),
  ).values(),
];

const entriesOf = (task: string): readonly TaskEntry[] =>
  rankedModels.flatMap((model) =>
    model.tasks.filter((result) => result.task === task).map((result) => ({ model, result })),
  );

export { entriesOf, rankedModels, tasks };
export type { TaskInfo };
