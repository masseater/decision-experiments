import type { Probe } from "@injection-bisect/core";

const NO_COST = 0;

const percent = new Intl.NumberFormat("ja-JP", { style: "percent", maximumFractionDigits: 1 });

const millis = new Intl.NumberFormat("ja-JP", {
  style: "unit",
  unit: "millisecond",
  maximumFractionDigits: 0,
});

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumSignificantDigits: 2,
});

const formatPercent = (value: number): string => percent.format(value);

const formatMillis = (value: number): string => millis.format(value);

const formatDollars = (value: number): string => dollars.format(value);

const totalCost = (probes: readonly Probe[]): number =>
  probes.reduce((sum, probe) => sum + probe.cost, NO_COST);

export { formatDollars, formatMillis, formatPercent, totalCost };
