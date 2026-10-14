import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Bench } from "./bench";
import { Limits } from "./limits";
import { Mechanism } from "./mechanism";

const More = (): ReactNode => (
  <details className="rounded-lg border px-4 py-3">
    <summary className="cursor-pointer text-sm font-medium">{COPY.more}</summary>
    <div className="mt-6 flex flex-col gap-10">
      <Mechanism />
      <Limits />
      <Bench />
    </div>
  </details>
);

export { More };
