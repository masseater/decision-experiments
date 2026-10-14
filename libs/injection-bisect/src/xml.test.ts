import { Effect } from "effect";
import { expect, test } from "vite-plus/test";

import { INJECTION, cleanedOf } from "./__tests__/fake-judge.ts";
import { sentencesOf } from "./segment.ts";

const textsOf = (text: string): readonly string[] =>
  sentencesOf({ text }).map(({ start, end }) => text.slice(start, end));

test("reads text, comments, attribute values and CDATA of a feed", () => {
  expect(
    textsOf(
      '<?xml version="1.0"?>\n<rss><channel><title>ニュース 一覧</title><!-- 注記 --><item><description><![CDATA[<p>本文です。</p>]]></description><link>https://a.example</link><media title="写真 です"/></item></channel></rss>',
    ),
  ).toStrictEqual(["ニュース 一覧", " 注記 ", "本文です。", "写真 です"]);
});

test("finds and removes an injection in an Atom entry", () =>
  Effect.runPromise(
    Effect.gen(function* atom() {
      const text = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>新機能のお知らせ</title><summary>${INJECTION}</summary></entry></feed>`;
      expect(yield* cleanedOf({ text })).toStrictEqual({
        found: [INJECTION],
        cleaned: text.replace(INJECTION, ""),
      });
    }),
  ));

test("reads attribute values holding the other quote", () => {
  expect(
    textsOf(`<?xml version="1.0"?><item title="Don't stop here" note='彼は"はい"と言った'/>`),
  ).toStrictEqual(["Don't stop here", '彼は"はい"と言った']);
});
