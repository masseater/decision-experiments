import type { ReactNode } from "react";

import { rankedModels } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import type { ChartRow } from "./chart-row";
import { percent } from "./format";
import { Section } from "./section";

const NOTE =
  "各タスクの skill の平均です。skill は Decision Index と同じく chance で正規化した値で、0 がランダム、100 が全問正解です。受け付けない形式のタスクは 0 として数えます。";

const rows: readonly ChartRow[] = rankedModels.map((model) => ({
  status: "measured",
  key: model.model,
  label: model.label,
  ratio: model.index,
  value: percent(model.index),
}));

const IndexSection = (): ReactNode => (
  <Section id="index" title="総合指数" note={NOTE}>
    <BarChart title="モデル別の指数（0〜100）" rows={rows} />
  </Section>
);

export { IndexSection };
