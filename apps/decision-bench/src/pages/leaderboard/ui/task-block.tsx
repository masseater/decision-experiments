import type { ReactNode } from "react";

import type { TaskInfo } from "#/pages/leaderboard/model/ranking";

import { ProfileTable } from "./profile-table";
import { ScoreTable } from "./score-table";
import { Section } from "./section";
import { TaskCharts } from "./task-charts";
import { taskNote } from "./task-note";

const TaskBlock = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => (
  <Section id={`task-${task.task}`} title={task.label} note={taskNote(task)}>
    <TaskCharts task={task.task} />
    <ScoreTable task={task} />
    <ProfileTable task={task} />
  </Section>
);

export { TaskBlock };
