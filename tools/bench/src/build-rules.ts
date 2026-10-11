import { Effect, Number as Num, Schema } from "effect";

import { ItemSchema } from "./item.ts";
import type { NoulItem } from "./item.ts";
import { askThrice, tally } from "./label.ts";
import { LABEL_CONCURRENCY, LabelStatsSchema, splitOf } from "./labeling.ts";
import { Opus, runBench } from "./runtime.ts";
import { benchPath, writeJson, writeJsonl } from "./store.ts";

const PER_THEME = 10;
const GENERATION_SAMPLE = 0;
const SOURCE = "Claude Opus 5.5 で生成した架空の社内規程と事例";
const LICENSE = "CC BY-SA 4.0";

const THEMES = [
  "経費精算",
  "出張旅費",
  "休暇取得",
  "勤怠と残業申請",
  "在宅勤務",
  "情報セキュリティ",
  "個人情報の取り扱い",
  "購買と発注承認",
  "接待と贈答",
  "契約書の締結権限",
  "社外への情報発信",
  "副業の届出",
  "備品の貸与と返却",
  "ハラスメント相談",
  "採用面接の運用",
  "顧客からの返品対応",
  "請求書の発行と支払期日",
  "社用車の利用",
  "ソフトウェアの導入申請",
  "安全衛生と事故報告",
] as const;

const GENERATOR_SYSTEM =
  "あなたは日本企業の社内規程と、その運用で起きる判断事例を作る作成者です。指定の形式で返してください。";

const GeneratedSchema = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      regulation: Schema.String,
      situation: Schema.String,
      criterion: Schema.String,
    }),
  ),
});

const generatorSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      minItems: PER_THEME,
      maxItems: PER_THEME,
      items: {
        type: "object",
        properties: {
          regulation: { type: "string", description: "規程の条文（2〜5文）" },
          situation: {
            type: "string",
            description: "社員や部署が実際に取った行動の事例（2〜5文）",
          },
          criterion: {
            type: "string",
            description: "事例が規程を満たすかを問う、はい・いいえで答える問い",
          },
        },
        required: ["regulation", "situation", "criterion"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

const generatorPrompt = (theme: string): string =>
  [
    `テーマ「${theme}」について、架空の会社の社内規程と判断事例を${PER_THEME}件作ってください。`,
    "各件は、規程の条文、事例、規程を満たすかを問う基準文の3つからなります。",
    "答えが「はい」になる事例と「いいえ」になる事例をおおよそ半数ずつにしてください。",
    "金額や日数の境界、例外条項、承認の順序など、条文を正確に読まないと間違える事例を半分以上含めてください。",
    "実在の企業名や個人名は使わないでください。",
  ].join("\n");

const generateTheme = Effect.fn("generateTheme")(function* generateTheme(
  theme: string,
  themeIndex: number,
) {
  const opus = yield* Opus;
  const { output, costUsd } = yield* opus.ask({
    system: GENERATOR_SYSTEM,
    prompt: generatorPrompt(theme),
    schema: GeneratedSchema,
    jsonSchema: generatorSchema,
    sample: GENERATION_SAMPLE,
  });
  return { theme, themeIndex, drafts: output.items, costUsd };
});

const labelDraft = Effect.fn("labelDraft")(function* labelDraft(
  draft: Readonly<{
    theme: string;
    themeIndex: number;
    index: number;
    regulation: string;
    situation: string;
    criterion: string;
  }>,
) {
  const question = {
    type: "noul" as const,
    text: `規程:\n${draft.regulation}\n\n事例:\n${draft.situation}`,
    criteria: draft.criterion,
    options: { true: "はい", false: "いいえ" },
  };
  const { answers, costUsd } = yield* askThrice(question);
  const { mode, agreement } = tally(answers);
  const item: NoulItem = {
    id: `rules-${draft.themeIndex}-${draft.index}`,
    ...question,
    gold: mode === "true",
    gold_source: "llm",
    agreement,
    source: `${SOURCE}（テーマ: ${draft.theme}）`,
    license: LICENSE,
    split: splitOf(agreement),
  };
  return { item, costUsd };
});

runBench(
  Effect.gen(function* buildRules() {
    const generated = yield* Effect.forEach(THEMES, generateTheme, {
      concurrency: LABEL_CONCURRENCY,
    });
    const drafts = generated.flatMap(({ theme, themeIndex, drafts: themeDrafts }) =>
      themeDrafts.map((draft, index) => ({ theme, themeIndex, index, ...draft })),
    );
    const labeled = yield* Effect.forEach(drafts, labelDraft, { concurrency: LABEL_CONCURRENCY });
    const items = labeled.map(({ item }) => item);
    yield* writeJsonl(ItemSchema, yield* benchPath("data", "rules.jsonl"), items);
    yield* writeJson(LabelStatsSchema, yield* benchPath("data", "rules.stats.json"), {
      task: "rules",
      items: items.length,
      hard: items.filter(({ split }) => split === "hard").length,
      opusCostUsd: Num.sumAll([...generated, ...labeled].map(({ costUsd }) => costUsd)),
    });
  }),
);
