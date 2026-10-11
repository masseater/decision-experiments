import type { ReactNode } from "react";

import type { TaskInfo } from "#/pages/leaderboard/model/ranking";

import { TaskCharts } from "./charts/task-charts";
import { NoteList } from "./note-list";
import { Section } from "./section";
import { ProfileTable } from "./tables/profile-table";
import { ScoreTable } from "./tables/score-table";
import { notesOf } from "./task-notes";

const TaskBlock = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => (
  <Section id={`task-${task.task}`} title={task.label}>
    <NoteList notes={notesOf(task)} />
    <TaskCharts task={task.task} />
    <ScoreTable task={task} />
    <ProfileTable task={task} />
  </Section>
);

export { TaskBlock };
