import { Effect, Match, Option } from "effect";

import type { Reader } from "./parser.ts";

const TOKEN =
  /\\(?<word>[a-z]+)(?<parameter>-?\d+)? ?|\\'(?<hex>[0-9a-f]{2})|\\(?<symbol>[^a-z])|(?<brace>[{}])|[\r\n]+|(?<text>[^\\{}\r\n]+)/giu;

const SKIPPED = new Set([
  "fonttbl",
  "colortbl",
  "stylesheet",
  "listtable",
  "listoverridetable",
  "revtbl",
  "rsidtbl",
  "generator",
  "pict",
  "object",
  "objdata",
  "themedata",
  "colorschememapping",
  "datastore",
  "latentstyles",
  "xmlnstbl",
  "fldinst",
  "bkmkstart",
  "bkmkend",
]);

const BREAKS = new Set(["par", "line", "sect", "page", "row"]);

const CELLS = new Set(["tab", "cell"]);

const SYMBOLS = new Map([
  ["~", " "],
  ["_", "-"],
  ["\n", "\n"],
  ["\r", "\n"],
  ["\\", "\\"],
  ["{", "{"],
  ["}", "}"],
]);

const CODE_PAGES = new Map([
  ["932", "shift_jis"],
  ["936", "gbk"],
  ["949", "euc-kr"],
  ["950", "big5"],
  ["65001", "utf8"],
]);

const HEX = 16;

const UNICODE_WRAP = 65_536;

const DEFAULT_SKIP = 1;

const NONE = 0;

const MARKER = String.raw`{\rtf`;

interface Group {
  readonly hidden: boolean;
  readonly skip: number;
}

interface State {
  readonly stack: readonly Group[];
  readonly group: Group;
  readonly codePage: string;
  readonly pending: readonly number[];
  readonly unicodeSkip: number;
  readonly opened: boolean;
}

type Token =
  | { readonly kind: "hex"; readonly byte: number }
  | { readonly kind: "open" }
  | { readonly kind: "close" }
  | { readonly kind: "symbol"; readonly symbol: string }
  | { readonly kind: "word"; readonly name: string; readonly value: number }
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "newline" };

type Step = readonly [State, string];

const latin1 = new TextDecoder("latin1");

const encodingOf = (codePage: string): string =>
  Option.getOrElse(Option.fromNullishOr(CODE_PAGES.get(codePage)), () => `windows-${codePage}`);

const decoderFor = (codePage: string): TextDecoder =>
  Option.liftThrowable(() => new TextDecoder(encodingOf(codePage)))().pipe(
    Option.getOrElse(() => new TextDecoder("windows-1252")),
  );

const tokenOf = (groups: Readonly<Record<string, string | undefined>>): Token => {
  const { word, parameter, hex, symbol, brace, text } = groups;
  return Match.value({ word, hex, symbol, brace, text }).pipe(
    Match.when({ hex: Match.string }, ({ hex: digits }) => ({
      kind: "hex" as const,
      byte: Number.parseInt(digits, HEX),
    })),
    Match.when({ brace: "{" }, () => ({ kind: "open" as const })),
    Match.when({ brace: "}" }, () => ({ kind: "close" as const })),
    Match.when({ symbol: Match.string }, ({ symbol: value }) => ({
      kind: "symbol" as const,
      symbol: value,
    })),
    Match.when({ word: Match.string }, ({ word: name }) => ({
      kind: "word" as const,
      name,
      value: Number(Option.getOrElse(Option.fromNullishOr(parameter), () => "0")),
    })),
    Match.when({ text: Match.string }, ({ text: value }) => ({
      kind: "text" as const,
      text: value,
    })),
    Match.orElse(() => ({ kind: "newline" as const })),
  );
};

const tokensOf = (rtf: string): readonly Token[] =>
  Array.from(rtf.matchAll(TOKEN), (match) =>
    tokenOf(Option.getOrElse(Option.fromNullishOr(match.groups), () => ({}))),
  );

const flushed = (state: State): Step => [
  { ...state, pending: [] },
  decoderFor(state.codePage).decode(Uint8Array.from(state.pending)),
];

const emitted = (state: State, text: string): Step => {
  const [next, bytes] = flushed(state);
  if (state.group.hidden) {
    return [next, bytes];
  }
  return [next, `${bytes}${text}`];
};

const hidden = (state: State): Step => [{ ...state, group: { ...state.group, hidden: true } }, ""];

const unicodeOf = (value: number): string => {
  if (value < NONE) {
    return String.fromCodePoint(value + UNICODE_WRAP);
  }
  return String.fromCodePoint(value);
};

const breakStep = (state: State): Step => emitted(state, "\n");

const cellStep = (state: State): Step => emitted(state, "\t");

const unicodeStep = (state: State, value: number): Step => {
  const [next, text] = emitted(state, unicodeOf(value));
  return [{ ...next, unicodeSkip: state.group.skip }, text];
};

const WORDS = new Map<string, (state: State, value: number) => Step>([
  ["ansicpg", (state, value): Step => [{ ...state, codePage: String(value) }, ""]],
  ["uc", (state, value): Step => [{ ...state, group: { ...state.group, skip: value } }, ""]],
  ["u", unicodeStep],
  ...[...BREAKS].map((name) => [name, breakStep] as const),
  ...[...CELLS].map((name) => [name, cellStep] as const),
]);

const wordStep = (state: State, name: string, value: number): Step => {
  if (state.opened && SKIPPED.has(name)) {
    return hidden(state);
  }
  return Option.match(Option.fromNullishOr(WORDS.get(name)), {
    onSome: (handle) => handle(state, value),
    onNone: (): Step => [state, ""],
  });
};

const hexStep = (state: State, byte: number): Step => {
  if (state.unicodeSkip > NONE) {
    return [{ ...state, unicodeSkip: state.unicodeSkip - DEFAULT_SKIP }, ""];
  }
  if (state.group.hidden) {
    return [state, ""];
  }
  return [{ ...state, pending: [...state.pending, byte] }, ""];
};

const textStep = (state: State, text: string): Step => {
  const skipped = Math.min(state.unicodeSkip, text.length);
  return emitted({ ...state, unicodeSkip: state.unicodeSkip - skipped }, text.slice(skipped));
};

const closeStep = (state: State): Step => {
  const [next, text] = flushed(state);
  return [
    {
      ...next,
      stack: state.stack.slice(NONE, -DEFAULT_SKIP),
      group: Option.getOrElse(
        Option.fromNullishOr(state.stack.at(-DEFAULT_SKIP)),
        () => state.group,
      ),
    },
    text,
  ];
};

const symbolStep = (state: State, symbol: string): Step => {
  if (symbol === "*") {
    return hidden(state);
  }
  const replacement = Option.getOrElse(Option.fromNullishOr(SYMBOLS.get(symbol)), () => "");
  return emitted(state, replacement);
};

const step = (state: State, token: Token): Step =>
  Match.value(token).pipe(
    Match.discriminatorsExhaustive("kind")({
      hex: ({ byte }): Step => hexStep(state, byte),
      open: (): Step => {
        const [next, text] = flushed(state);
        return [{ ...next, stack: [...state.stack, state.group], opened: true }, text];
      },
      close: (): Step => closeStep(state),
      symbol: ({ symbol }): Step => symbolStep(state, symbol),
      word: ({ name, value }): Step => wordStep(state, name, value),
      text: ({ text }): Step => textStep(state, text),
      newline: (): Step => [state, ""],
    }),
  );

const INITIAL: State = {
  stack: [],
  group: { hidden: false, skip: DEFAULT_SKIP },
  codePage: "1252",
  pending: [],
  unicodeSkip: NONE,
  opened: false,
};

const textOfRtf = (rtf: string): string => {
  const out: string[] = [];
  let state = INITIAL;
  for (const token of tokensOf(rtf)) {
    const [next, text] = step({ ...state, opened: state.opened && token.kind === "word" }, token);
    out.push(text);
    state = { ...next, opened: next.opened && token.kind === "open" };
  }
  out.push(flushed(state)[DEFAULT_SKIP]);
  return out
    .join("")
    .replaceAll(/[ \t]+\n/gu, "\n")
    .trim();
};

const rtfReader: Reader = {
  format: "rtf",
  extensions: [".rtf"],
  accepts: (bytes) => latin1.decode(bytes.subarray(NONE, MARKER.length)) === MARKER,
  read: (bytes) => Effect.succeed({ text: textOfRtf(latin1.decode(bytes)), format: "plain" }),
};

export { rtfReader };
