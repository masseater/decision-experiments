import type { ReactNode } from "react";

import { summary } from "#/pages/leaderboard/model/summary";

import { LabelTable } from "./label-table";
import { Section } from "./section";

const NOTE = "正解ラベルの件数と、Opus 5.5 でラベルを付けたときの費用です。";

const LabelSection = (): ReactNode => (
  <Section id="labels" title="正解ラベル" note={NOTE}>
    <LabelTable labeling={summary.labeling} labelledBy="labels" />
  </Section>
);

export { LabelSection };
