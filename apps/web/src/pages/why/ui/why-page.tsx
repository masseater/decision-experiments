import type { ReactNode } from "react";

import { Compare } from "./compare";
import { Flow } from "./flow";
import { Hero } from "./hero";
import { More } from "./more";
import { Scenarios } from "./scenarios";
import { Stats } from "./stats";

const WhyPage = (): ReactNode => (
  <main className="mx-auto flex max-w-4xl flex-col gap-12 px-4 py-10 md:px-8">
    <div className="flex flex-col gap-8">
      <Hero />
      <Flow />
    </div>
    <Compare />
    <Stats />
    <Scenarios />
    <More />
  </main>
);

export { WhyPage };
