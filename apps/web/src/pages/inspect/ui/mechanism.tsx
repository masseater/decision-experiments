import { DEFAULT_MODEL, QUESTION } from "@injection-bisect/core";
import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";

import { Legend } from "./legend";

const Mechanism = (): ReactNode => (
  <section className="flex flex-col gap-3 text-sm leading-relaxed">
    <h2 className="text-lg font-semibold">{COPY.mechanism}</h2>
    <ol className="list-decimal space-y-1 pl-5">
      {COPY.steps.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ol>
    <p className="text-muted-foreground">{COPY.cost}</p>
    <details className="rounded-md border px-3 py-2">
      <summary className="cursor-pointer">{COPY.question}</summary>
      <p className="text-muted-foreground mt-2 font-mono text-xs">{DEFAULT_MODEL}</p>
      <p className="mt-1 font-mono text-xs">{QUESTION}</p>
    </details>
    <Legend />
  </section>
);

export { Mechanism };
