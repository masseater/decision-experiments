import { LabelStatsSchema } from "bench-summary/schema";
import { Config, Effect, Number as Num, Schema } from "effect";

import { ItemSchema } from "./item.ts";
import type { ChoiceItem } from "./item.ts";
import { askThrice, splitOf, tally } from "./label.ts";
import { runBench } from "./runtime.ts";
import { dataPath, readJsonl, sha256, writeJson, writeJsonl } from "./store.ts";

const TASK = "jnli";
const OPUS_SAMPLE = 200;
const LABEL_CONCURRENCY = 4;
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

const toItem = (row: JnliRow): ChoiceItem => ({
  id: `${TASK}-${row.sentence_pair_id}`,
  type: "choice",
  text: `文1: ${row.sentence1}\n文2: ${row.sentence2}`,
  criteria: "文1と文2の関係として正しいものを選んでください。",
  options: OPTIONS,
  gold: row.label,
  gold_source: "human",
  source: SOURCE,
  license: LICENSE,
  split: "test",
});

const labelRow = Effect.fn("labelRow")(function* labelRow(row: JnliRow) {
  const base = toItem(row);
  const { answers, costUsd } = yield* askThrice(base);
  const { mode, agreement } = tally(answers);
  const item: ChoiceItem = { ...base, agreement, split: splitOf(agreement) };
  return { item, costUsd, opusMatches: mode === row.label };
});

const orderRows = Effect.fn("orderRows")(function* orderRows(rows: readonly JnliRow[]) {
  const keyed = yield* Effect.forEach(
    rows,
    (row) => sha256(row.sentence_pair_id).pipe(Effect.map((order) => ({ row, order }))),
    { concurrency: "unbounded" },
  );
  return keyed
    .toSorted((left, right) => left.order.localeCompare(right.order))
    .map(({ row }) => row);
});

runBench(
  Effect.gen(function* buildJnli() {
    const source = yield* Config.String("JNLI_VALID_JSON");
    const rows = yield* readJsonl(JnliRowSchema, source);
    const ordered = yield* orderRows(rows);
    const labeled = yield* Effect.forEach(ordered.slice(FIRST, OPUS_SAMPLE), labelRow, {
      concurrency: LABEL_CONCURRENCY,
    });
    const items = [
      ...labeled.map(({ item }) => item),
      ...ordered.slice(OPUS_SAMPLE).map((row) => toItem(row)),
    ];
    yield* writeJsonl(ItemSchema, yield* dataPath({ task: TASK, extension: "jsonl" }), items);
    yield* writeJson(LabelStatsSchema, yield* dataPath({ task: TASK, extension: "stats.json" }), {
      task: TASK,
      items: items.length,
      hard: items.filter(({ split }) => split === "hard").length,
      opusCostUsd: Num.sumAll(labeled.map(({ costUsd }) => costUsd)),
      opusMatchesHuman: labeled.filter(({ opusMatches }) => opusMatches).length / labeled.length,
      opusSampled: labeled.length,
    });
  }),
);
