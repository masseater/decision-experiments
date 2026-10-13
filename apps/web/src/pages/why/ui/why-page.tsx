import type { ReactNode } from "react";

import { BenchSection } from "./bench-section";
import { Cleanup } from "./cleanup";
import { Hero } from "./hero";
import { Hijack } from "./hijack";
import { Layers } from "./layers";
import { Limits } from "./limits";
import { Uses } from "./uses";

const WhyPage = (): ReactNode => (
  <main className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-10 md:px-8">
    <Hero />
    <Layers />
    <BenchSection />
    <Hijack />
    <Cleanup />
    <Uses />
    <Limits />
  </main>
);

export { WhyPage };
