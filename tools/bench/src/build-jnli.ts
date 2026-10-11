import { Config, Effect, Number as Num, Schema } from "effect";

import { ItemSchema } from "./item.ts";
import type { ChoiceItem } from "./item.ts";
import { askThrice, tally } from "./label.ts";
import { LABEL_CONCURRENCY, LabelStatsSchema, splitOf } from "./labeling.ts";
import { runBench } from "./runtime.ts";
import { benchPath, readJsonl, sha256, writeJson, writeJsonl } from "./store.ts";

const SIZE = 200;
const FIRST = 0;
const JGLUE_COMMIT = "6f071c09316baae89c3d083a90985b4b1cb9968c";
const SOURCE = `JGLUE JNLI v1.3 valid (yahoojapan/JGLUE@${JGLUE_COMMIT})`;
const LICENSE = "CC BY-SA 4.0";

const OPTIONS = {
  entailment: "文1が正しいなら、文2も必ず正しい（含意）",
  contradiction: "文1が正しいなら、文2は正しくない（矛盾）",
  neutral: "文1だけでは、文2が正しいかどうか決まらない（中立）",
};

const JnliRowSchema = Schema.Struct({
  sentence_pair_id: Schema.String,
  sentence1: Schema.String,
  sentence2: Schema.String,
  label: Schema.Literals(["entailment", "contradiction", "neutral"]),
});

type JnliRow = typeof JnliRowSchema.Type;

const labelRow = Effect.fn("labelRow")(function* labelRow(row: JnliRow) {
  const question = {
    type: "choice" as const,
    text: `文1: ${row.sentence1}\n文2: ${row.sentence2}`,
    criteria: "文1と文2の関係として正しいものを選んでください。",
    options: OPTIONS,
  };
  const { answers, costUsd } = yield* askThrice(question);
  const { mode, agreement } = tally(answers);
  const item: ChoiceItem = {
    id: `jnli-${row.sentence_pair_id}`,
    ...question,
    gold: row.label,
    gold_source: "human",
    agreement,
    source: SOURCE,
    license: LICENSE,
    split: splitOf(agreement),
  };
  return { item, costUsd, opusMatches: mode === row.label };
});

const pickRows = Effect.fn("pickRows")(function* pickRows(rows: readonly JnliRow[]) {
  const keyed = yield* Effect.forEach(
    rows,
    (row) => sha256(row.sentence_pair_id).pipe(Effect.map((order) => ({ row, order }))),
    { concurrency: "unbounded" },
  );
  return keyed
    .toSorted((left, right) => left.order.localeCompare(right.order))
    .slice(FIRST, SIZE)
    .map(({ row }) => row);
});

runBench(
  Effect.gen(function* buildJnli() {
    const source = yield* Config.String("JNLI_VALID_JSON");
    const rows = yield* readJsonl(JnliRowSchema, source);
    const labeled = yield* Effect.forEach(yield* pickRows(rows), labelRow, {
      concurrency: LABEL_CONCURRENCY,
    });
    const items = labeled.map(({ item }) => item);
    yield* writeJsonl(ItemSchema, yield* benchPath("data", "jnli.jsonl"), items);
    yield* writeJson(LabelStatsSchema, yield* benchPath("data", "jnli.stats.json"), {
      task: "jnli",
      items: items.length,
      hard: items.filter(({ split }) => split === "hard").length,
      opusCostUsd: Num.sumAll(labeled.map(({ costUsd }) => costUsd)),
      opusMatchesHuman: labeled.filter(({ opusMatches }) => opusMatches).length / items.length,
    });
  }),
);
