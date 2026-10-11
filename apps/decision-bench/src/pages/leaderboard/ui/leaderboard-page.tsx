import type { ReactNode } from "react";

import { summary } from "#/pages/leaderboard/model/summary";

import { DetailSection } from "./detail-section";
import { Disclaimer } from "./disclaimer";
import { IndexSection } from "./index-section";
import { LabelSection } from "./label-section";
import { LatencySection } from "./latency-section";
import { SupportSection } from "./support-section";
import { TaskSection } from "./task-section";

const TITLE = "日本語 decision model ベンチマーク";

const LeaderboardPage = (): ReactNode => (
  <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-8 sm:px-8">
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">{TITLE}</h1>
      <Disclaimer />
    </header>
    <IndexSection />
    <TaskSection />
    <SupportSection />
    <LatencySection />
    <DetailSection />
    <LabelSection />
    <footer className="text-muted-foreground text-xs">{`更新: ${summary.generatedAt}`}</footer>
  </main>
);

export { LeaderboardPage };
