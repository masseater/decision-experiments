import { TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

import type { TaskEntry } from "#/pages/leaderboard/model/ranking";

import { ReliabilityFigure } from "./charts/reliability-figure";
import { NoteList } from "./note-list";
import type { Note } from "./note-list";
import { Section } from "./section";

const NOTES: readonly Note[] = [
  { icon: <TrendingDown aria-hidden="true" />, text: "対角線より下は過信" },
];

const ReliabilitySection = ({
  entries,
}: Readonly<{ entries: readonly TaskEntry[] }>): ReactNode => (
  <Section id="calibration" title="確信度と実際の正解率">
    <NoteList notes={NOTES} />
    {entries
      .filter(({ result }) => result.test.calibration.status === "measured")
      .map((entry) => (
        <ReliabilityFigure key={entry.model.model} entry={entry} />
      ))}
  </Section>
);

export { ReliabilitySection };
