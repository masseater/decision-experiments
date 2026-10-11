import type { ReactNode } from "react";

import { rankedModels } from "#/pages/leaderboard/model/ranking";

import { BarChart } from "./charts/bar-chart";
import { ChartFigure } from "./charts/chart-figure";
import type { ChartRow } from "./charts/chart-row";
import { Section } from "./section";
import { IndexTable } from "./tables/index-table";

const CHART_TITLE = "指数";

const rows: readonly ChartRow[] = rankedModels.map((model) => ({
  status: "point",
  key: model.model,
  label: model.label,
  ratio: model.index,
}));

const IndexSection = (): ReactNode => (
  <Section id="index" title="総合指数（参考）">
    <ChartFigure title={CHART_TITLE}>
      <BarChart title={CHART_TITLE} rows={rows} />
    </ChartFigure>
    <IndexTable />
  </Section>
);

export { IndexSection };
