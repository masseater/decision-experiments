"use client";

import type { ReactNode } from "react";
import { Bar, CartesianGrid, BarChart as Chart, Tooltip, XAxis, YAxis } from "recharts";

import { pointsOf, toPercentPoints } from "#/pages/leaderboard/ui/format";
import { ChartContainer } from "#/shared/ui/chart";

import type { ChartRow } from "./chart-row";
import { AXIS_TICK, MARK_RADIUS, ORIGIN, PERCENT_SCALE, SERIES_COLOR } from "./chart-style";
import { DetailTooltip } from "./detail-tooltip";
import { errorOf, intervalBar } from "./interval-bar";
import type { Detail } from "./model-detail";

const LABEL_WIDTH = 104;
const BAR_SIZE = 14;
const BAR_RADIUS: [number, number, number, number] = [ORIGIN, MARK_RADIUS, MARK_RADIUS, ORIGIN];
const VALUE_WIDTH = 40;
const MARGIN = { right: 8 } as const;
const ROW_HEIGHT = 36;
const AXIS_HEIGHT = 40;

type BarPoint = Readonly<{
  label: string;
  value: number;
  text: string;
  detail: Detail;
  error?: readonly [number, number];
}>;

const toPoint = (row: ChartRow): readonly BarPoint[] => {
  if (row.status === "unsupported") {
    return [];
  }
  const value = toPercentPoints(row.ratio);
  if (row.status === "point") {
    return [{ label: row.label, value, text: pointsOf(value), detail: row.detail }];
  }
  const error = errorOf({
    value,
    lower: toPercentPoints(row.interval.lower),
    upper: toPercentPoints(row.interval.upper),
  });
  return [{ label: row.label, value, text: pointsOf(value), detail: row.detail, error }];
};

const toPoints = (rows: readonly ChartRow[]): readonly BarPoint[] =>
  rows.flatMap((row) => toPoint(row));

const describe = ({
  rows,
  title,
}: Readonly<{ rows: readonly ChartRow[]; title: string }>): string =>
  `${title}: ${toPoints(rows)
    .map(({ label, value }) => `${label} ${pointsOf(value)}`)
    .join("、")}`;

const BarChart = ({
  rows,
  title,
}: Readonly<{ rows: readonly ChartRow[]; title: string }>): ReactNode => (
  <ChartContainer size="fit" height={rows.length * ROW_HEIGHT + AXIS_HEIGHT}>
    <Chart desc={describe({ rows, title })} data={toPoints(rows)} layout="vertical" margin={MARGIN}>
      <CartesianGrid horizontal={false} />
      <XAxis type="number" dataKey="value" domain={PERCENT_SCALE} tick={AXIS_TICK} />
      <YAxis type="category" dataKey="label" width={LABEL_WIDTH} tick={AXIS_TICK} />
      <YAxis
        yAxisId="value"
        type="category"
        dataKey="text"
        orientation="right"
        width={VALUE_WIDTH}
        axisLine={false}
        tickLine={false}
        tick={AXIS_TICK}
      />
      <Tooltip content={DetailTooltip} />
      <Bar
        isAnimationActive={false}
        dataKey="value"
        name={title}
        fill={SERIES_COLOR}
        radius={BAR_RADIUS}
        barSize={BAR_SIZE}
      >
        {intervalBar("x")}
      </Bar>
    </Chart>
  </ChartContainer>
);

export { BarChart };
