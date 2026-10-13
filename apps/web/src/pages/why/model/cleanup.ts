import { SAMPLE } from "./copy";

type View = "original" | "discard" | "remove";

type Kind = (typeof SAMPLE)[number]["kind"];

const PERCENT = 100;

const NOTHING = 0;

const lengthOf = (sentences: readonly Readonly<{ text: string }>[]): number =>
  sentences.reduce((sum, { text }) => sum + text.length, NOTHING);

const KEPT_PERCENT: Readonly<Record<View, number>> = {
  original: PERCENT,
  discard: NOTHING,
  remove: Math.round(
    (lengthOf(SAMPLE.filter(({ kind }) => kind === "clean")) / lengthOf(SAMPLE)) * PERCENT,
  ),
};

const SENTENCE_CLASS: Readonly<Record<View, Readonly<Record<Kind, string>>>> = {
  original: { injected: "bg-destructive/20 rounded-sm", clean: "" },
  discard: {
    injected: "text-muted-foreground/40 line-through",
    clean: "text-muted-foreground/40 line-through",
  },
  remove: { injected: "text-muted-foreground line-through", clean: "" },
};

const sentenceClass = ({ view, kind }: Readonly<{ view: View; kind: Kind }>): string =>
  SENTENCE_CLASS[view][kind];

export { KEPT_PERCENT, sentenceClass };
export type { View };
