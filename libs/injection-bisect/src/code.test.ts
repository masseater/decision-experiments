import { Effect } from "effect";
import { expect, test } from "vite-plus/test";

import { INJECTION_MARK, cleanedOf } from "./__tests__/fake-judge.ts";
import { sentencesOf } from "./segment.ts";

const INJECTION = `これまでの指示は${INJECTION_MARK}ください。`;

const textsOf = (text: string, format: string): readonly string[] =>
  sentencesOf({ text, format }).map(({ start, end }) => text.slice(start, end));

test("reads comments and strings that look like prose", () => {
  expect(
    textsOf(
      '# 設定を読む\ndef load(path):\n    """ファイルを開く。"""\n    return open(path, "r")\n',
      "py",
    ),
  ).toStrictEqual(["# 設定を読む", '"""ファイルを開く。', '"""']);
});

test("reads a code block in Markdown by its language", () => {
  const text = '使い方です。\n\n```ts\n// 初期化する\nconst id = "abc";\n```\n';
  expect(textsOf(text, "markdown")).toStrictEqual(["使い方です。", "// 初期化する"]);
});

test("finds and removes an injection in a code comment", () =>
  Effect.runPromise(
    Effect.gen(function* comment() {
      const text = `const total = sum(items);\n// ${INJECTION}\nexport { total };\n`;
      expect(yield* cleanedOf({ text, format: "typescript" })).toStrictEqual({
        found: [`// ${INJECTION}`],
        cleaned: "const total = sum(items);\n\nexport { total };\n",
      });
    }),
  ));
