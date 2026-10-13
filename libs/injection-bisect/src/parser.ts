interface Span {
  readonly start: number;
  readonly end: number;
}

type Unit =
  | (Span & { readonly kind: "prose" })
  | (Span & { readonly kind: "nested"; readonly format: string });

interface Parser {
  readonly format: string;
  readonly accepts: (text: string) => boolean;
  readonly unitsOf: (text: string) => readonly Unit[];
}

export type { Parser, Span, Unit };
