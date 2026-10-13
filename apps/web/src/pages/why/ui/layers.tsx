import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";
import { leakOf, useBack, useFront, useSetBack, useSetFront } from "#/pages/why/model/layers";

import { LeakBars } from "./leak-bars";
import { PercentSlider } from "./percent-slider";
import { Section } from "./section";

const Layers = (): ReactNode => {
  const back = useBack();
  const front = useFront();
  return (
    <Section title={COPY.layers.title}>
      <PercentSlider label={COPY.layers.back} value={back} onChange={useSetBack()} />
      <PercentSlider label={COPY.layers.front} value={front} onChange={useSetFront()} />
      <LeakBars alone={leakOf([back])} both={leakOf([back, front])} />
      <p className="text-muted-foreground text-xs">{COPY.layers.caveat}</p>
    </Section>
  );
};

export { Layers };
