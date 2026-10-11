import { DateTime, Effect, FileSystem, Number as Num, Option, Schema } from "effect";

import { ItemSchema, OutcomeSchema } from "./item.ts";
import type { Item } from "./item.ts";
import { LabelStatsSchema } from "./labeling.ts";
import { makeOpenRouterAdapter } from "./openrouter.ts";
import { runBench } from "./runtime.ts";
import { metric, usage } from "./score.ts";
import type { Scored } from "./score.ts";
import { benchPath, readJsonl, writeJson } from "./store.ts";
import { SummarySchema } from "./summary.ts";
import type { Summary } from "./summary.ts";

const CONCURRENCY = 4;
const PERCENT = 100;
const PERCENT_DIGITS = 1;
const COST_DIGITS = 4;
const LABEL_COST_DIGITS = 2;
const START = "<!-- results:start -->";
const END = "<!-- results:end -->";

const DATASETS = ["jnli", "rules"] as const;

const TASKS = [
  { id: "jnli", label: "JNLI 含意関係（Choice）", data: "jnli", format: "choice" },
  { id: "rules", label: "業務ルール判定（Noul）", data: "rules", format: "noul" },
] as const;

const MODELS = [
  { id: "typesafe/jev-1.13", label: "Jev 1.13", choiceVia: "choice" },
  { id: "liquid/d1", label: "Liquid d1", choiceVia: "choice" },
  { id: "perplexity/pplx-decider-v1.1-27b", label: "Perplexity Decider v1.1", choiceVia: "choice" },
  { id: "openai/gpt-6-luna-decisions", label: "GPT-6 Luna Decisions", choiceVia: "choice" },
  { id: "microsoft/microsoft-decision-1", label: "Microsoft Decision 1", choiceVia: "choice" },
  { id: "upstage/solar-decide", label: "Solar Decide", choiceVia: "choice" },
  { id: "upstage/solar-decide-flash", label: "Solar Decide Flash", choiceVia: "choice" },
  { id: "inception/mercury-decide", label: "Mercury Decide", choiceVia: "choice" },
  { id: "cloudflare/clef", label: "Clef", choiceVia: "choice" },
  { id: "cloudflare/clef-flash", label: "Clef Flash", choiceVia: "choice" },
  { id: "cloudflare/clef-omni", label: "Clef Omni", choiceVia: "choice" },
  { id: "nace-ai/drex-v1.5", label: "Drex v1.5", choiceVia: "choice" },
  { id: "togethercomputer/tev1-4b-experimental", label: "Tev1 4B", choiceVia: "choice" },
  { id: "jaredpalmer/kev-4b", label: "Kev 4B", choiceVia: "choice" },
  { id: "respan/span-01", label: "span-01", choiceVia: "noul" },
  { id: "respan/span-01-lite", label: "span-01 lite", choiceVia: "noul" },
] as const;

type Task = (typeof TASKS)[number] & Readonly<{ items: readonly Item[] }>;

const DetailSchema = Schema.Struct({
  model: Schema.String,
  outcomes: Schema.Array(Schema.Struct({ id: Schema.String, outcome: OutcomeSchema })),
});

const pct = (value: number): string => (value * PERCENT).toFixed(PERCENT_DIGITS);

const humanMatch = (value: Option.Option<number>): string =>
  Option.match(value, { onNone: () => "-", onSome: (rate) => `${pct(rate)}%` });

const modelRows = (summary: Summary): readonly string[] =>
  summary.models.flatMap((model) =>
    model.tasks.map((task) =>
      [
        model.label,
        pct(model.index),
        task.label,
        pct(task.test.skill),
        pct(task.test.raw),
        `${task.test.failed}/${task.test.total}`,
        `${task.p50Ms} / ${task.p95Ms}`,
        task.costPer1000Usd.toFixed(COST_DIGITS),
      ].join(" | "),
    ),
  );

const labelRows = (summary: Summary): readonly string[] =>
  summary.labeling.map((stats) =>
    [
      stats.task,
      String(stats.items),
      String(stats.hard),
      stats.opusCostUsd.toFixed(LABEL_COST_DIGITS),
      humanMatch(Option.fromNullishOr(stats.opusMatchesHuman)),
    ].join(" | "),
  );

const table = (summary: Summary): string =>
  [
    "| モデル | 指数 | タスク | skill（test） | raw（test） | 失敗 | p50 / p95 (ms) | 1,000 判定あたり (USD) |",
    "| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |",
    ...modelRows(summary).map((row) => `| ${row} |`),
    "",
    "| タスク | 件数 | hard | Opus 5.5 のラベル費用 (USD) | Opus 5.5 と人の正解の一致率 |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...labelRows(summary).map((row) => `| ${row} |`),
  ].join("\n");

const supportOf = (
  test: Readonly<{ failed: number; total: number }>,
): "supported" | "unsupported" => {
  if (test.failed === test.total) {
    return "unsupported";
  }
  return "supported";
};

const runTask = Effect.fn("runTask")(function* runTask(
  adapter: Effect.Success<ReturnType<typeof makeOpenRouterAdapter>>,
  task: Task,
) {
  const rows = yield* Effect.forEach(
    task.items,
    (item) => adapter.decide(item).pipe(Effect.map((outcome): Scored => ({ item, outcome }))),
    { concurrency: CONCURRENCY },
  );
  const test = metric(rows.filter(({ item }) => item.split === "test"));
  const result = {
    task: task.id,
    label: task.label,
    format: task.format,
    support: supportOf(test),
    test,
    hard: metric(rows.filter(({ item }) => item.split === "hard")),
    ...usage(rows),
  };
  return { rows, result };
});

const runModel = Effect.fn("runModel")(function* runModel(
  model: (typeof MODELS)[number],
  tasks: readonly Task[],
) {
  const adapter = yield* makeOpenRouterAdapter(model.id, model.choiceVia);
  const ran = yield* Effect.forEach(tasks, (task) => runTask(adapter, task), { discard: false });
  const results = ran.map(({ result }) => result);
  yield* writeJson(
    DetailSchema,
    yield* benchPath("results", `${model.id.replaceAll("/", "__")}.json`),
    {
      model: model.id,
      outcomes: ran.flatMap(({ rows }) =>
        rows.map(({ item, outcome }) => ({ id: item.id, outcome })),
      ),
    },
  );
  return {
    model: model.id,
    label: model.label,
    choiceVia: model.choiceVia,
    index: Num.sumAll(results.map(({ test }) => test.skill)) / results.length,
    costUsd: Num.sumAll(results.map(({ costUsd }) => costUsd)),
    tasks: results,
  };
});

const loadTask = Effect.fn("loadTask")(function* loadTask(task: (typeof TASKS)[number]) {
  const items = yield* readJsonl(ItemSchema, yield* benchPath("data", `${task.data}.jsonl`));
  return { ...task, items };
});

const loadStats = Effect.fn("loadStats")(function* loadStats(data: (typeof DATASETS)[number]) {
  const fileSystem = yield* FileSystem.FileSystem;
  const text = yield* fileSystem.readFileString(yield* benchPath("data", `${data}.stats.json`));
  return yield* Schema.decodeEffect(Schema.fromJsonString(LabelStatsSchema))(text);
});

const updateReadme = Effect.fn("updateReadme")(function* updateReadme(summary: Summary) {
  const fileSystem = yield* FileSystem.FileSystem;
  const readme = yield* benchPath("..", "..", "README.md");
  const [head = "", rest = ""] = (yield* fileSystem.readFileString(readme)).split(START);
  const [, tail = ""] = rest.split(END);
  yield* fileSystem.writeFileString(
    readme,
    `${head}${START}\n\n${table(summary)}\n\n${END}${tail}`,
  );
});

runBench(
  Effect.gen(function* runAll() {
    const tasks = yield* Effect.forEach(TASKS, (task) => loadTask(task), { discard: false });
    const summary: Summary = {
      generatedAt: DateTime.formatIso(yield* DateTime.now),
      models: yield* Effect.forEach(MODELS, (model) => runModel(model, tasks), {
        concurrency: "unbounded",
      }),
      labeling: yield* Effect.forEach(DATASETS, (data) => loadStats(data), { discard: false }),
    };
    yield* writeJson(SummarySchema, yield* benchPath("results", "summary.json"), summary);
    yield* updateReadme(summary);
  }),
);
