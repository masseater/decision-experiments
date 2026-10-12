import type { ReactNode } from "react";

import { useInspect } from "#/pages/inspect/api/use-inspect";
import { COPY } from "#/pages/inspect/model/copy";
import { useRun } from "#/pages/inspect/model/draft";

import { InspectForm } from "./inspect-form";
import { Mechanism } from "./mechanism";
import { RunView } from "./run-view";

const InspectPage = (): ReactNode => {
  const state = useInspect(useRun());
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-mono text-2xl font-bold">{COPY.title}</h1>
        <p className="text-muted-foreground">{COPY.lead}</p>
      </header>
      <Mechanism />
      <InspectForm state={state} />
      <RunView state={state} />
    </main>
  );
};

export { InspectPage };
