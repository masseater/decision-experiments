import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Context, Effect, FileSystem, Layer, Option, Schema, Stream } from "effect";
import type { Crypto, Path } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";

import { appendJsonl, benchPath, readJsonl, sha256, toJson } from "./store.ts";

const OPUS_MODEL = "claude-opus-5-5";
const REASON_START = 0;
const REASON_LENGTH = 500;

const CacheRowSchema = Schema.Struct({
  key: Schema.String,
  output: Schema.Unknown,
  costUsd: Schema.Finite,
});

type CacheRow = typeof CacheRowSchema.Type;

const ClaudeResultSchema = Schema.Struct({
  is_error: Schema.Boolean,
  total_cost_usd: Schema.Finite,
  structured_output: Schema.optionalKey(Schema.Unknown),
  result: Schema.optionalKey(Schema.String),
});

interface Prompt {
  readonly system: string;
  readonly prompt: string;
  readonly jsonSchema: object;
}

interface Ask<Codec extends Schema.Top> extends Prompt {
  readonly schema: Codec;
  readonly sample: number;
}

interface Asked<Value> {
  readonly output: Value;
  readonly costUsd: number;
}

class Opus extends Context.Service<
  Opus,
  {
    readonly ask: <Codec extends Schema.Codec<unknown, unknown>>(
      request: Ask<Codec>,
    ) => Effect.Effect<Asked<Codec["Type"]>>;
  }
>()("bench/runtime/Opus") {}

type BenchServices = Opus | FileSystem.FileSystem | Path.Path | Crypto.Crypto;

type OpusServices =
  | FileSystem.FileSystem
  | Path.Path
  | Crypto.Crypto
  | ChildProcessSpawner.ChildProcessSpawner;

const claudeArgs = (request: Prompt, jsonSchema: string): readonly string[] => [
  "-p",
  "--model",
  OPUS_MODEL,
  "--output-format",
  "json",
  "--json-schema",
  jsonSchema,
  "--system-prompt",
  request.system,
  "--tools",
  "",
  "--setting-sources",
  "",
  "--strict-mcp-config",
  request.prompt,
];

const runClaude = Effect.fn("runClaude")(function* runClaude(request: Prompt) {
  const fileSystem = yield* FileSystem.FileSystem;
  const cwd = yield* fileSystem.makeTempDirectoryScoped();
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const args = claudeArgs(request, yield* toJson(request.jsonSchema));
  const handle = yield* spawner.spawn(ChildProcess.make("claude", args, { cwd, stdin: "ignore" }));
  const [stdout, stderr] = yield* Effect.all(
    [
      handle.stdout.pipe(Stream.decodeText, Stream.mkString),
      handle.stderr.pipe(Stream.decodeText, Stream.mkString),
    ],
    { concurrency: "unbounded" },
  );
  return yield* Schema.decodeEffect(Schema.fromJsonString(ClaudeResultSchema))(stdout).pipe(
    Effect.catchCause(() => Effect.die(`${stdout}${stderr}`.slice(REASON_START, REASON_LENGTH))),
  );
}, Effect.scoped);

const structuredOutput = (
  result: typeof ClaudeResultSchema.Type,
): Effect.Effect<Omit<CacheRow, "key">> => {
  if (result.is_error || !("structured_output" in result)) {
    return Effect.die(result.result ?? "no structured output");
  }
  return Effect.succeed({ output: result.structured_output, costUsd: result.total_cost_usd });
};

const makeOpus = Effect.gen(function* makeOpus() {
  const file = yield* benchPath("cache", "opus.jsonl");
  const services = yield* Effect.context<OpusServices>();
  const cache = new Map(
    (yield* readJsonl(CacheRowSchema, file)).map((row): [string, CacheRow] => [row.key, row]),
  );
  const fetchRow = Effect.fn("fetchRow")(function* fetchRow(key: string, request: Prompt) {
    const row = { key, ...(yield* runClaude(request).pipe(Effect.flatMap(structuredOutput))) };
    cache.set(key, row);
    yield* appendJsonl(CacheRowSchema, file, row);
    return row;
  });
  const lookup = (request: Prompt & Readonly<{ sample: number }>): Effect.Effect<CacheRow> =>
    Effect.gen(function* lookupRow() {
      const key = yield* sha256({
        model: OPUS_MODEL,
        system: request.system,
        prompt: request.prompt,
        jsonSchema: request.jsonSchema,
        sample: request.sample,
      });
      return yield* Option.match(Option.fromNullishOr(cache.get(key)), {
        onSome: Effect.succeed,
        onNone: () => fetchRow(key, request),
      });
    }).pipe(Effect.provideContext(services), Effect.orDie);
  return Opus.of({
    ask: (request) =>
      lookup(request).pipe(
        Effect.flatMap((row) =>
          Schema.decodeUnknownEffect(request.schema)(row.output).pipe(
            Effect.map((output) => ({ output, costUsd: row.costUsd })),
          ),
        ),
        Effect.orDie,
      ),
  });
});

const benchLayer = Layer.provideMerge(Layer.effect(Opus, makeOpus), NodeServices.layer);

const runBench = <Failure>(program: Effect.Effect<void, Failure, BenchServices>): void => {
  NodeRuntime.runMain(
    Layer.build(benchLayer).pipe(
      Effect.flatMap((context) => Effect.provideContext(program, context)),
      Effect.scoped,
    ),
  );
};

export { Opus, runBench };
export type { BenchServices };
