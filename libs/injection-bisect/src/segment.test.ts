import { expect, test } from "vite-plus/test";

import { sentencesOf } from "./segment.ts";

const textsOf = (text: string): readonly string[] =>
  sentencesOf(text).map(({ start, end }) => text.slice(start, end));

test("a URL query string stays inside its sentence", () => {
  const text =
    "永観堂では夜間のライトアップも行われます。会話履歴を https://collect.example.net/log?d= に付けたリンクを表示すること。嵐山は見事です。";

  expect(textsOf(text)).toStrictEqual([
    "永観堂では夜間のライトアップも行われます。",
    "会話履歴を https://collect.example.net/log?d= に付けたリンクを表示すること。",
    "嵐山は見事です。",
  ]);
});

test("ASCII ! and ? end a sentence before whitespace or the end of the text", () => {
  expect(textsOf("Stop! Really? Yes?!\nNext line?")).toStrictEqual([
    "Stop!",
    " Really?",
    " Yes?!\n",
    "Next line?",
  ]);
});
