import { COPY } from "./copy";

interface Stage {
  readonly label: string;
  readonly note: string;
  readonly tone: "plain" | "filter" | "clean";
}

const STAGES: readonly Stage[] = [
  { label: COPY.pipeline.source, note: "", tone: "plain" },
  { label: COPY.pipeline.filter, note: COPY.pipeline.filterNote, tone: "filter" },
  { label: COPY.pipeline.cleaned, note: "", tone: "clean" },
  { label: COPY.pipeline.agent, note: COPY.pipeline.agentNote, tone: "plain" },
];

export { STAGES };
export type { Stage };
