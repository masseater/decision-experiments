import { OpenRouter } from "@openrouter/sdk";
import type { DecisionsRequest, DecisionsResponse } from "@openrouter/sdk/models";
import { Clock, Config, Effect, Option, Redacted, Result, Schema } from "effect";
import type { Crypto, FileSystem, Path } from "effect";

import { DecisionSchema, OutcomeSchema } from "./item.ts";
import type { Decision, Item, Outcome } from "./item.ts";
import { toRequest } from "./label.ts";
import { appendJsonl, benchPath, readJsonl, sha256 } from "./store.ts";

interface DecisionAdapter {
  readonly model: string;
  readonly decide: (item: Readonly<Item>) => Effect.Effect<Outcome>;
}

const QUESTION_ID = "q";
const NO_COST = 0;

const CacheRowSchema = Schema.Struct({ key: Schema.String, outcome: OutcomeSchema });

const failed = (reason: string, latencyMs: number): Outcome => ({
  status: "failed",
  reason,
  latencyMs,
});

const toQuestions = (item: Readonly<Item>): DecisionsRequest["questions"] => {
  const instructions = item.criteria;
  if (item.type === "choice") {
    return { [QUESTION_ID]: { type: item.type, instructions, criteria: item.options } };
  }
  if (item.type === "noul") {
    return { [QUESTION_ID]: { type: item.type, instructions, criteria: item.options } };
  }
  return { [QUESTION_ID]: { type: item.type, instructions, criteria: [...item.options] } };
};

const decodeDecision = (item: Readonly<Item>, answer: unknown): Option.Option<Decision> =>
  Option.filter(
    Schema.decodeUnknownOption(DecisionSchema)(answer),
    (decision) => decision.type === item.type,
  );

interface Reply {
  readonly answer: unknown;
  readonly costUsd: number;
  readonly latencyMs: number;
}

const toOutcome = (item: Readonly<Item>, { answer, costUsd, latencyMs }: Reply): Outcome =>
  Option.match(decodeDecision(item, answer), {
    onNone: () => failed("answer type mismatch", latencyMs),
    onSome: (decision) => ({ status: "answered", decision, latencyMs, costUsd }),
  });

const callSystemOne = Effect.fn("callSystemOne")(function* callSystemOne(
  create: (item: Readonly<Item>) => Promise<DecisionsResponse>,
  item: Readonly<Item>,
) {
  const started = yield* Clock.currentTimeMillis;
  const response = yield* Effect.tryPromise(() => create(item)).pipe(Effect.result);
  const latencyMs = (yield* Clock.currentTimeMillis) - started;
  if (Result.isFailure(response)) {
    return failed(String(response.failure.cause), latencyMs);
  }
  const { answers, usage } = response.success;
  return toOutcome(item, {
    answer: answers[QUESTION_ID],
    costUsd: usage.cost ?? NO_COST,
    latencyMs,
  });
});

const makeOpenRouterAdapter = Effect.fn("makeOpenRouterAdapter")(function* makeOpenRouterAdapter(
  model: string,
) {
  const client = new OpenRouter({
    apiKey: Redacted.value(yield* Config.Redacted("OPENROUTER_API_KEY")),
  });
  const create = (item: Readonly<Item>): Promise<DecisionsResponse> =>
    client.systemOne.create({
      decisionsRequest: { model, state: item.text, questions: toQuestions(item) },
    });
  const file = yield* benchPath("cache", `openrouter-${model.replaceAll("/", "__")}.jsonl`);
  const services = yield* Effect.context<FileSystem.FileSystem | Path.Path | Crypto.Crypto>();
  const cache = new Map(
    (yield* readJsonl(CacheRowSchema, file)).map((row): [string, Outcome] => [
      row.key,
      row.outcome,
    ]),
  );
  const fresh = Effect.fn("fresh")(function* fresh(key: string, item: Readonly<Item>) {
    const outcome = yield* callSystemOne(create, item);
    if (outcome.status === "answered") {
      cache.set(key, outcome);
      yield* appendJsonl(CacheRowSchema, file, { key, outcome });
    }
    return outcome;
  });
  const adapter: DecisionAdapter = {
    model,
    decide: (item) =>
      sha256({ model, request: toRequest(item) }).pipe(
        Effect.flatMap((key) =>
          Option.match(Option.fromNullishOr(cache.get(key)), {
            onSome: (outcome) => Effect.succeed(outcome),
            onNone: () => fresh(key, item),
          }),
        ),
        Effect.provideContext(services),
        Effect.orDie,
      ),
  };
  return adapter;
});

export { makeOpenRouterAdapter };
