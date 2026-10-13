import { QUESTION } from "@injection-bisect/core";
import { Clock, Split } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";

import { Legend } from "./legend";
import { Note } from "./note";

const Mechanism = (): ReactNode => (
  <section className="flex flex-col gap-3 text-sm leading-relaxed">
    <h2 className="text-lg font-semibold">{COPY.mechanism}</h2>
    <ol className="list-decimal space-y-1 pl-5">
      {COPY.steps.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ol>
    <Note text={COPY.cost}>
      <Clock />
    </Note>
    <Note text={COPY.separate}>
      <Split />
    </Note>
    <details className="rounded-md border px-3 py-2">
      <summary className="cursor-pointer">{COPY.question}</summary>
      <p className="mt-2 font-mono text-xs">{QUESTION}</p>
    </details>
    <Legend />
  </section>
);

export { Mechanism };
