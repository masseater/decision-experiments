import type { ReactNode } from "react";

import { cn } from "#/shared/lib/utils";

type BarTone = "danger" | "safe" | "neutral";

const SCALE = 1000;

const HEIGHT = 10;

const MIN_WIDTH = 6;

const EMPTY = 0;

const FILL: Readonly<Record<BarTone, string>> = {
  danger: "fill-destructive",
  safe: "fill-primary",
  neutral: "fill-muted-foreground",
};

const widthOf = (value: number, max: number): number => {
  if (max === EMPTY) {
    return MIN_WIDTH;
  }
  return Math.max((value / max) * SCALE, MIN_WIDTH);
};

const Bar = ({
  label,
  value,
  max,
  text,
  tone,
}: Readonly<{
  label: string;
  value: number;
  max: number;
  text: string;
  tone: BarTone;
}>): ReactNode => (
  <div className="grid grid-cols-1 items-center gap-1 text-sm md:grid-cols-3 md:gap-3">
    <dt className={cn("truncate", tone === "neutral" && "font-mono text-xs")}>{label}</dt>
    <svg
      aria-hidden="true"
      className="bg-muted/50 h-3 w-full rounded-sm"
      viewBox={`0 0 ${SCALE} ${HEIGHT}`}
      preserveAspectRatio="none"
    >
      <rect className={FILL[tone]} width={widthOf(value, max)} height={HEIGHT} />
    </svg>
    <dd className="font-mono">{text}</dd>
  </div>
);

export { Bar };
export type { BarTone };
