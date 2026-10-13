import type { SAMPLE } from "./copy";

type View = "raw" | "cleaned";

type Kind = (typeof SAMPLE)[number]["kind"];

const SENTENCE_CLASS: Readonly<Record<View, Readonly<Record<Kind, string>>>> = {
  raw: { injected: "bg-destructive/20 text-destructive rounded-sm", clean: "" },
  cleaned: { injected: "text-muted-foreground/50 line-through", clean: "" },
};

const sentenceClass = ({ view, kind }: Readonly<{ view: View; kind: Kind }>): string =>
  SENTENCE_CLASS[view][kind];

export { sentenceClass };
export type { View };
