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
  { id: "jnli", label: "JNLI 含意関係", data: "jnli", format: "choice", metric: "macro-f1" },
  {
    id: "rules",
    label: "業務ルール判定",
    data: "rules",
    format: "noul",
    metric: "balanced-accuracy",
  },
] as const;

const MODELS = [{ id: "respan/span-01-lite", label: "span-01 lite", choiceVia: "noul" }] as const;

type Task = (typeof TASKS)[number] & Readonly<{ items: readonly Item[] }>;

const DetailSchema = Schema.Struct({
  model: Schema.String,
  outcomes: Schema.Array(Schema.Struct({ id: Schema.String, outcome: OutcomeSchema })),
});

const pct = (value: number): string => (value * PERCENT).toFixed(PERCENT_DIGITS);

const humanMatch = (value: Option.Option<number>): string =>
  Option.match(value, { onNone: () => "-", onSome: (rate) => `${pct(rate)}%` });

const indexTable = (summary: Summary): readonly string[] => [
  "| モデル | 指数（参考） |",
  "| --- | ---: |",
  ...summary.models.map((model) => `| ${model.label} | ${pct(model.index)} |`),
];

const labelLine = (stats: Summary["labeling"][number]): string =>
  `正解ラベル: ${stats.items} 件（hard ${stats.hard} 件）、Opus 5.5 のラベル費用（API 換算） ${stats.opusCostUsd.toFixed(LABEL_COST_DIGITS)} USD、Opus 5.5 と人の正解の一致率 ${humanMatch(Option.fromNullishOr(stats.opusMatchesHuman))}。`;

const taskTable = (summary: Summary, task: (typeof TASKS)[number]): readonly string[] => [
  `### ${task.label}（${task.format}、raw は ${task.metric}）`,
  "",
  ...summary.labeling.filter((stats) => stats.task === task.data).map((stats) => labelLine(stats)),
  "",
  "| モデル | skill | raw | 正解率 | coverage | p50 / p95 (ms) | 1,000 判定あたり (USD) |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...summary.models.flatMap((model) =>
    model.tasks
      .filter((result) => result.task === task.id)
      .map((result) =>
        [
          "",
          model.label,
          pct(result.test.skill),
          pct(result.test.raw),
          pct(result.test.accuracy),
          pct(result.test.coverage),
          `${result.p50Ms} / ${result.p95Ms}`,
          result.costPer1000Usd.toFixed(COST_DIGITS),
          "",
        ]
          .join(" | ")
          .trim(),
      ),
  ),
];

const table = (summary: Summary): string =>
  [...indexTable(summary), ...TASKS.flatMap((task) => ["", ...taskTable(summary, task)])].join(
    "\n",
  );

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
    metric: task.metric,
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
