import { displayLabel } from "#/pages/leaderboard/model/display-label";
import { entriesOf } from "#/pages/leaderboard/model/ranking";
import type { TaskResult } from "#/pages/leaderboard/model/summary";

import type { ChartRow } from "./chart-row";

type Measure = (result: Readonly<TaskResult>) => Readonly<{ ratio: number; value: string }>;

const taskRows = ({
  task,
  unsupported,
  measure,
}: Readonly<{ task: string; unsupported: string; measure: Measure }>): readonly ChartRow[] =>
  entriesOf(task).map(({ model, result }): ChartRow => {
    const label = displayLabel({ model, result });
    if (result.support === "unsupported") {
      return { status: "unsupported", key: model.model, label, note: unsupported };
    }
    const { ratio, value } = measure(result);
    return { status: "measured", key: model.model, label, ratio, value };
  });

export { taskRows };
export type { Measure };
