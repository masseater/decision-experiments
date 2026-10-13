import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { COPY } from "#/pages/why/model/copy";

import { Pipeline } from "./pipeline";

const Hero = (): ReactNode => (
  <header className="flex flex-col gap-6">
    <h1 className="font-mono text-2xl font-bold">{COPY.title}</h1>
    <p className="text-lg">{COPY.lead}</p>
    <Pipeline />
    <Link
      to="/"
      className="text-primary flex items-center gap-1 text-sm underline-offset-4 hover:underline"
    >
      {COPY.demo}
      <ArrowRight className="size-4" />
    </Link>
  </header>
);

export { Hero };
