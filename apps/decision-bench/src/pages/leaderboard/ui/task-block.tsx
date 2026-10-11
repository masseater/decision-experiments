import type { ReactNode } from "react";

import type { TaskInfo } from "#/pages/leaderboard/model/ranking";
import { useVisibleEntries } from "#/pages/leaderboard/model/view";

import { ReliabilityFigures } from "./charts/reliability-figures";
import { TaskCharts } from "./charts/task-charts";
import { NoteList } from "./note-list";
import { Section } from "./section";
import { ProfileTable } from "./tables/profile-table";
import { ScoreTable } from "./tables/score-table";
import { notesOf } from "./task-notes";

const TaskBlock = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => {
  const entries = useVisibleEntries(task.task);
  return (
    <Section id={`task-${task.task}`} title={task.label}>
      <NoteList notes={notesOf(task)} />
      <TaskCharts entries={entries} />
      <ScoreTable task={task} entries={entries} />
      <ProfileTable task={task} entries={entries} />
      <ReliabilityFigures entries={entries} />
    </Section>
  );
};

export { TaskBlock };
