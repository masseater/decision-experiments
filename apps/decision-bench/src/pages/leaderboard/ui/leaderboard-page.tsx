import { Clock, FlaskConical, Tag } from "lucide-react";
import type { ReactNode } from "react";

import { tasks } from "#/pages/leaderboard/model/ranking";
import { summary } from "#/pages/leaderboard/model/summary";

import { IndexSection } from "./index-section";
import { MethodLink } from "./method-link";
import { NoteList } from "./note-list";
import type { Note } from "./note-list";
import { TaskBlock } from "./task-block";

const TITLE = "日本語 decision model ベンチマーク";

const NOTES: readonly Note[] = [
  {
    icon: <Tag aria-hidden="true" />,
    text: "正解ラベルは Claude Opus 5.5 が付けたもの（JNLI は人のラベル）",
  },
  { icon: <FlaskConical aria-hidden="true" />, text: "勉強目的の実験" },
];

const updatedAt = summary.generatedAt.replace(/T(?<time>\d{2}:\d{2}).*$/u, " $<time> UTC");

const LeaderboardPage = (): ReactNode => (
  <main className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-8 sm:px-8">
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">{TITLE}</h1>
      <NoteList notes={NOTES} />
      <MethodLink />
    </header>
    <IndexSection />
    {tasks.map((task) => (
      <TaskBlock key={task.task} task={task} />
    ))}
    <footer className="text-muted-foreground flex items-center gap-2 text-xs">
      <Clock aria-hidden="true" className="size-3" />
      <time dateTime={summary.generatedAt}>{updatedAt}</time>
    </footer>
  </main>
);

export { LeaderboardPage };
