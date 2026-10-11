import type { ReactNode } from "react";

import { slowestP50, tasks } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import { ms } from "./format";
import { Section } from "./section";
import { taskRows } from "./task-rows";
import type { Measure } from "./task-rows";

const NOTE =
  "OpenRouter 経由で 1 件を判定するのにかかった時間の中央値（p50）です。棒の長さは全タスク共通の目盛りです。";
const UNSUPPORTED = "未対応";
const MIN_SCALE = 1;

const measure: Measure = (result) => ({
  ratio: result.p50Ms / Math.max(MIN_SCALE, slowestP50),
  value: ms(result.p50Ms),
});

const LatencySection = (): ReactNode => (
  <Section id="latency" title="レイテンシ" note={NOTE}>
    {tasks.map((task) => (
      <BarChart
        key={task.task}
        title={`${task.label} の p50`}
        rows={taskRows({ task: task.task, unsupported: UNSUPPORTED, measure })}
      />
    ))}
  </Section>
);

export { LatencySection };
