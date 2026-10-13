import { QUESTION, asksTogether } from "@injection-bisect/core";
import { Clock, Split } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { useModel } from "#/pages/inspect/model/draft";

import { Legend } from "./legend";
import { Note } from "./note";

const modeOf = (model: string): keyof typeof COPY.steps => {
  if (asksTogether(model)) {
    return "together";
  }
  return "bisect";
};

const Mechanism = (): ReactNode => {
  const mode = modeOf(useModel());
  return (
    <section className="flex flex-col gap-3 text-sm leading-relaxed">
      <h2 className="text-lg font-semibold">{COPY.mechanism}</h2>
      <ol className="list-decimal space-y-1 pl-5">
        {COPY.steps[mode].map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ol>
      <Note text={COPY.cost[mode]}>
        <Clock />
      </Note>
      <Note text={COPY.separate[mode]}>
        <Split />
      </Note>
      <details className="rounded-md border px-3 py-2">
        <summary className="cursor-pointer">{COPY.question}</summary>
        <p className="mt-2 font-mono text-xs">{QUESTION}</p>
      </details>
      <Legend />
    </section>
  );
};

export { Mechanism };
