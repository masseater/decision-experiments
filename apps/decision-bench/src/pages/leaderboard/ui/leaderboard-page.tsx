import type { ReactNode } from "react";

import { summary } from "#/pages/leaderboard/model/summary";

import { Disclaimer } from "./disclaimer";
import { LabelTable } from "./label-table";
import { ModelTable } from "./model-table";

const TITLE = "日本語 decision model ベンチマーク";
const LEADERBOARD = "リーダーボード";
const SKILL_NOTE =
  "skill は Decision Index と同じく chance で正規化した値で、0 がランダム、100 が全問正解です。";
const LABELS = "正解ラベル";

const LeaderboardPage = (): ReactNode => (
  <main className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
    <header className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">{TITLE}</h1>
      <Disclaimer />
    </header>
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{LEADERBOARD}</h2>
      <p className="text-muted-foreground text-sm">{SKILL_NOTE}</p>
      <ModelTable models={summary.models} />
    </section>
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{LABELS}</h2>
      <LabelTable labeling={summary.labeling} />
    </section>
    <footer className="text-muted-foreground text-xs">{`更新: ${summary.generatedAt}`}</footer>
  </main>
);

export { LeaderboardPage };
