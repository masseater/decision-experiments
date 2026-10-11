import type { ReactNode } from "react";

import { tasks } from "#/pages/leaderboard/model/ranking";
import { summary } from "#/pages/leaderboard/model/summary";

import { Disclaimer } from "./disclaimer";
import { IndexSection } from "./index-section";
import { TaskBlock } from "./task-block";

const TITLE = "日本語 decision model ベンチマーク";

const LeaderboardPage = (): ReactNode => (
  <main className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-8 sm:px-8">
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">{TITLE}</h1>
      <Disclaimer />
    </header>
    <IndexSection />
    {tasks.map((task) => (
      <TaskBlock key={task.task} task={task} />
    ))}
    <footer className="text-muted-foreground text-xs">{`更新: ${summary.generatedAt}`}</footer>
  </main>
);

export { LeaderboardPage };
