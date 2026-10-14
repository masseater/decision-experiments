import type { ReactNode } from "react";

import { BenchDetails } from "./bench-details";
import { Compare } from "./compare";
import { Hero } from "./hero";
import { Limits } from "./limits";
import { Mechanism } from "./mechanism";
import { Scenarios } from "./scenarios";
import { Stats } from "./stats";

const WhyPage = (): ReactNode => (
  <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 md:px-8">
    <Hero />
    <Compare />
    <Mechanism />
    <Stats />
    <Scenarios />
    <Limits />
    <BenchDetails />
  </main>
);

export { WhyPage };
