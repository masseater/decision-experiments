import { FlaskConical, Tag } from "lucide-react";
import type { ReactNode } from "react";

import { IndexSection } from "./index-section";
import { MethodLink } from "./method-link";
import { NoteList } from "./note-list";
import type { Note } from "./note-list";
import { PageShell } from "./page-shell";
import { TaskLinks } from "./task-links";

const TITLE = "日本語 decision model ベンチマーク";

const NOTES: readonly Note[] = [
  {
    icon: <Tag aria-hidden="true" />,
    text: "正解ラベルは Claude Opus 5.5 が付けたもの（JNLI は人のラベル）",
  },
  { icon: <FlaskConical aria-hidden="true" />, text: "勉強目的の実験" },
];

const HEADER = (
  <>
    <h1 className="text-2xl font-bold">{TITLE}</h1>
    <NoteList notes={NOTES} />
    <MethodLink />
  </>
);

const LeaderboardPage = (): ReactNode => (
  <PageShell header={HEADER}>
    <TaskLinks />
    <IndexSection />
  </PageShell>
);

export { LeaderboardPage };
