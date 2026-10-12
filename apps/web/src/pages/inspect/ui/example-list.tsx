import type { ReactNode } from "react";

import { COPY } from "#/pages/inspect/model/copy";
import { EXAMPLES } from "#/pages/inspect/model/examples";

import { ExamplePicker } from "./example-picker";

const ExampleList = (): ReactNode => (
  <div aria-label={COPY.examples} className="flex flex-wrap gap-2">
    {EXAMPLES.map((example) => (
      <ExamplePicker key={example.name} example={example} />
    ))}
  </div>
);

export { ExampleList };
