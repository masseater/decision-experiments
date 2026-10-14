import type { ReactNode } from "react";

import { COPY, SAMPLE } from "#/pages/why/model/copy";

const LOOK = {
  kept: "",
  removed: "text-muted-foreground line-through",
} as const;

const Example = (): ReactNode => (
  <figure className="flex flex-col gap-2 rounded-lg border p-5">
    <p className="text-sm leading-relaxed">
      {SAMPLE.map(({ text, kind }) => (
        <span key={text} className={LOOK[kind]}>
          {text}
        </span>
      ))}
    </p>
    <figcaption className="text-muted-foreground text-xs">{COPY.reason.caption}</figcaption>
  </figure>
);

export { Example };
