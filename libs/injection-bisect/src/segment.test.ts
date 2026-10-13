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

test("joins a sentence wrapped across lines", () => {
  expect(textsOf("前の文です。\nこの文は途中で\n折り返しています。\n次の文です。")).toStrictEqual([
    "前の文です。\n",
    "この文は途中で\n折り返しています。\n",
    "次の文です。",
  ]);
});

test("keeps lines that end a tag or start a list item apart", () => {
  expect(textsOf("<p>本文</p>\n<!-- 指示\n続き -->\n- 項目\n- 次の項目")).toStrictEqual([
    "<p>本文</p>\n",
    "<!-- 指示\n続き -->\n",
    "- 項目\n",
    "- 次の項目",
  ]);
});
