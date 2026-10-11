import type { ReactNode } from "react";

import type { TaskInfo } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import { percent } from "./format";
import { ProfileTable } from "./profile-table";
import { ScoreTable } from "./score-table";
import { Section } from "./section";
import { taskNote } from "./task-note";
import { taskRows } from "./task-rows";
import type { Measure } from "./task-rows";

const UNSUPPORTED = "未対応（この形式を受け付けない）";

const measure: Measure = (result) => ({
  ratio: result.test.skill,
  value: percent(result.test.skill),
});

const TaskBlock = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => (
  <Section id={`task-${task.task}`} title={task.label} note={taskNote(task)}>
    <BarChart
      title="skill（0〜100）"
      rows={taskRows({ task: task.task, unsupported: UNSUPPORTED, measure })}
    />
    <ScoreTable task={task} />
    <ProfileTable task={task} />
  </Section>
);

export { TaskBlock };
