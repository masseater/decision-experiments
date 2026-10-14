import { EyeOff, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Example } from "./example";
import { Line } from "./line";
import { Section } from "./section";

const Reason = (): ReactNode => (
  <Section title={COPY.reason.title}>
    <Line text={COPY.reason.after}>
      <ShieldCheck />
    </Line>
    <Line text={COPY.reason.unseen}>
      <EyeOff />
    </Line>
    <Example />
  </Section>
);

export { Reason };
