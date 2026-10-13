import { Fragment } from "react";
import type { ReactNode } from "react";

import { STAGES } from "#/pages/why/model/pipeline";

import { Arrow } from "./arrow";
import { StageCard } from "./stage-card";

const FIRST = 0;

const Pipeline = (): ReactNode => (
  <ol className="flex flex-col gap-2 md:flex-row md:items-stretch">
    {STAGES.map((stage, index) => (
      <Fragment key={stage.label}>
        {index !== FIRST && <Arrow />}
        <StageCard stage={stage} />
      </Fragment>
    ))}
  </ol>
);

export { Pipeline };
