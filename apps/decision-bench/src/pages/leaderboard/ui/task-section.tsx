import type { ReactNode } from "react";

import { tasks } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import { percent } from "./format";
import { Section } from "./section";
import { taskRows } from "./task-rows";
import type { Measure } from "./task-rows";

const NOTE =
  "test 分割の skill（0〜100）です。正解率そのもの（raw）は下の全数値の表にあります。Noul のタスクの raw は「はい」と「いいえ」それぞれの正解率の平均（balanced accuracy）です。* は Choice を受け付けないモデルで、選択肢ごとに Noul で聞き「はい」の確率が最も高いものを答えにしています。";
const UNSUPPORTED = "未対応（この形式を受け付けない）";

const measure: Measure = (result) => ({
  ratio: result.test.skill,
  value: percent(result.test.skill),
});

const TaskSection = (): ReactNode => (
  <Section id="tasks" title="タスク別のスコア" note={NOTE}>
    {tasks.map((task) => (
      <BarChart
        key={task.task}
        title={`${task.label} の skill`}
        rows={taskRows({ task: task.task, unsupported: UNSUPPORTED, measure })}
      />
    ))}
  </Section>
);

export { TaskSection };
