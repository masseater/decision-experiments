import type { ReactNode } from "react";

import { rankedModels } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./bar-chart";
import type { ChartRow } from "./chart-row";
import { percent } from "./format";
import { Section } from "./section";

const NOTE =
  "性質の違うタスクをまたぐ参考値です。指数 = 100 × 各タスクの skill の単純平均。skill = (raw − chance) ÷ (1 − chance) を 0〜1 に収めた値で、0 がランダム、1 が満点です。Jev Decision Index と同じく、未対応・エラーの問題は 0 点として分母に残します。各タスクの成績は下の枠を見てください。";

const rows: readonly ChartRow[] = rankedModels.map((model) => ({
  status: "measured",
  key: model.model,
  label: model.label,
  ratio: model.index,
  value: percent(model.index),
}));

const IndexSection = (): ReactNode => (
  <Section id="index" title="総合指数（参考）" note={NOTE}>
    <BarChart title="モデル別の指数（0〜100）" rows={rows} />
  </Section>
);

export { IndexSection };
