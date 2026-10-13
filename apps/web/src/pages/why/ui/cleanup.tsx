import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Panel } from "./panel";
import { Section } from "./section";

const Cleanup = (): ReactNode => (
  <Section title={COPY.cleanup.title}>
    <div className="grid gap-4 md:grid-cols-3">
      <Panel view="original" title={COPY.cleanup.original} />
      <Panel view="discard" title={COPY.cleanup.discard} />
      <Panel view="remove" title={COPY.cleanup.remove} />
    </div>
  </Section>
);

export { Cleanup };
