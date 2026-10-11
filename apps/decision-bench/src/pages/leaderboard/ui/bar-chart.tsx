"use client";

import type { ReactNode } from "react";
import { Bar, CartesianGrid, BarChart as Chart, Tooltip, XAxis, YAxis } from "recharts";
import type { LabelListProps } from "recharts";

import { ChartContainer } from "#/shared/ui/chart";

import type { ChartRow } from "./chart-row";
import {
  AXIS_TICK,
  MARK_RADIUS,
  ORIGIN,
  PERCENT_SCALE,
  SERIES_COLOR,
  TOOLTIP_STYLE,
} from "./chart-style";
import { pointsOf, toPercentPoints } from "./format";

const LABEL_WIDTH = 104;
const BAR_SIZE = 14;
const BAR_RADIUS: [number, number, number, number] = [ORIGIN, MARK_RADIUS, MARK_RADIUS, ORIGIN];
const VALUE_LABEL: LabelListProps = { position: "right", fontSize: 12, formatter: pointsOf };
const MARGIN = { right: 40 } as const;

const toPoints = (
  rows: readonly ChartRow[],
): readonly Readonly<{ label: string; value: number }>[] =>
  rows.flatMap((row) => {
    if (row.status === "unsupported") {
      return [];
    }
    return [{ label: row.label, value: toPercentPoints(row.ratio) }];
  });

const describe = (rows: readonly ChartRow[]): string =>
  toPoints(rows)
    .map(({ label, value }) => `${label}: ${pointsOf(value)}`)
    .join("、");

const BarChart = ({
  rows,
  title,
}: Readonly<{ rows: readonly ChartRow[]; title: string }>): ReactNode => (
  <ChartContainer size="compact">
    <Chart
      title={title}
      desc={describe(rows)}
      data={toPoints(rows)}
      layout="vertical"
      margin={MARGIN}
    >
      <CartesianGrid horizontal={false} />
      <XAxis type="number" dataKey="value" domain={PERCENT_SCALE} tick={AXIS_TICK} />
      <YAxis type="category" dataKey="label" width={LABEL_WIDTH} tick={AXIS_TICK} />
      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={pointsOf} />
      <Bar
        isAnimationActive={false}
        dataKey="value"
        fill={SERIES_COLOR}
        radius={BAR_RADIUS}
        barSize={BAR_SIZE}
        label={VALUE_LABEL}
      />
    </Chart>
  </ChartContainer>
);

export { BarChart };
