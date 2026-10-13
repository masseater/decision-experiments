import type { ReactNode } from "react";

import { HEADLINE, INJECTED_TEXTS } from "#/pages/why/model/bench";
import { COPY } from "#/pages/why/model/copy";

import { Stat } from "./stat";

const MS_PER_SECOND = 1000;

const COST_DIGITS = 2;

const SECOND_DIGITS = 1;

const Stats = (): ReactNode => (
  <section className="flex flex-col gap-3">
    <dl className="grid gap-4 md:grid-cols-3">
      <Stat label={COPY.stats.missed} value={`${HEADLINE.missed} / ${INJECTED_TEXTS}`} />
      <Stat
        label={COPY.stats.time}
        value={`${(HEADLINE.medianMs / MS_PER_SECOND).toLocaleString("ja-JP", { maximumFractionDigits: SECOND_DIGITS })} ${COPY.stats.seconds}`}
      />
      <Stat
        label={COPY.stats.cost}
        value={`$${HEADLINE.dollarsPerText.toLocaleString("en-US", { maximumSignificantDigits: COST_DIGITS })}`}
      />
    </dl>
    <p className="text-muted-foreground text-xs">{COPY.stats.caption}</p>
    <p className="text-sm">{COPY.stats.versus}</p>
  </section>
);

export { Stats };
