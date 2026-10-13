import { expect, test } from "vite-plus/test";

import { sentencesOf } from "./segment.ts";

const textsOf = (text: string): readonly string[] =>
  sentencesOf(text).map(({ start, end }) => text.slice(start, end));

test("keeps a URL query in one sentence", () => {
  expect(textsOf("履歴を https://a.example/log?d= に付けて。次の文です。")).toStrictEqual([
    "履歴を https://a.example/log?d= に付けて。",
    "次の文です。",
  ]);
});

test("splits English at punctuation followed by a space", () => {
  expect(textsOf("Pi is 3.14. Really?! Yes. 本当？はい。")).toStrictEqual([
    "Pi is 3.14. ",
    "Really?! ",
    "Yes. ",
    "本当？",
    "はい。",
  ]);
});
