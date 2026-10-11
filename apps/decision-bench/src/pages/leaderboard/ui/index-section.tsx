import type { ReactNode } from "react";

import type { ModelResult } from "#/pages/leaderboard/model/summary";
import { useVisibleModels } from "#/pages/leaderboard/model/view";

import { BarChart } from "./charts/bar-chart";
import { ChartFigure } from "./charts/chart-figure";
import type { ChartRow } from "./charts/chart-row";
import { Section } from "./section";
import { IndexTable } from "./tables/index-table";

const CHART_TITLE = "指数";

const rowsOf = (models: readonly ModelResult[]): readonly ChartRow[] =>
  models.map((model) => ({
    status: "point",
    key: model.model,
    label: model.label,
    ratio: model.index,
  }));

const IndexSection = (): ReactNode => {
  const models = useVisibleModels();
  return (
    <Section id="index" title="総合指数（参考）">
      <ChartFigure title={CHART_TITLE}>
        <BarChart title={CHART_TITLE} rows={rowsOf(models)} />
      </ChartFigure>
      <IndexTable models={models} />
    </Section>
  );
};

export { IndexSection };
