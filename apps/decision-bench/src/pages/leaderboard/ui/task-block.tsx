import type { ReactNode } from "react";

import type { TaskEntry, TaskInfo } from "#/pages/leaderboard/model/ranking";
import { useVisibleEntries } from "#/pages/leaderboard/model/view";

import { ReliabilityFigure } from "./charts/reliability-figure";
import { TaskCharts } from "./charts/task-charts";
import { NoteList } from "./note-list";
import { Section } from "./section";
import { ProfileTable } from "./tables/profile-table";
import { ScoreTable } from "./tables/score-table";
import { notesOf } from "./task-notes";

const measuredOf = (entries: readonly TaskEntry[]): readonly TaskEntry[] =>
  entries.filter(({ result }) => result.test.calibration.status === "measured");

const TaskBlock = ({ task }: Readonly<{ task: TaskInfo }>): ReactNode => {
  const entries = useVisibleEntries(task.task);
  return (
    <Section id={`task-${task.task}`} title={task.label}>
      <NoteList notes={notesOf(task)} />
      <TaskCharts entries={entries} />
      <ScoreTable task={task} entries={entries} />
      <ProfileTable task={task} entries={entries} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {measuredOf(entries).map((entry) => (
          <ReliabilityFigure key={entry.model.model} entry={entry} />
        ))}
      </div>
    </Section>
  );
};

export { TaskBlock };
