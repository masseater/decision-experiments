import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Bar } from "./bar";

const DIGITS = 2;

const percentOf = (leak: number): string =>
  `${leak.toLocaleString("ja-JP", { maximumSignificantDigits: DIGITS })}%`;

const LeakBars = ({ alone, both }: Readonly<{ alone: number; both: number }>): ReactNode => (
  <dl className="flex flex-col gap-3">
    <Bar
      label={COPY.layers.alone}
      value={alone}
      max={alone}
      text={percentOf(alone)}
      tone="danger"
    />
    <Bar label={COPY.layers.both} value={both} max={alone} text={percentOf(both)} tone="safe" />
  </dl>
);

export { LeakBars };
