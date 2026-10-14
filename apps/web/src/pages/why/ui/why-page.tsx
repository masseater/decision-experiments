import type { ReactNode } from "react";

import { Intro } from "./intro";
import { Limits } from "./limits";
import { Method } from "./method";
import { Reason } from "./reason";
import { Results } from "./results";
import { Usage } from "./usage";

const WhyPage = (): ReactNode => (
  <main className="mx-auto flex max-w-2xl flex-col gap-14 px-4 py-12 md:px-8">
    <Intro />
    <Reason />
    <Method />
    <Results />
    <Usage />
    <Limits />
  </main>
);

export { WhyPage };
