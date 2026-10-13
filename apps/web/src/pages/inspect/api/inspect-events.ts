import { ProbeListener, detect, openRouterPerRequest, withApiKey } from "@injection-bisect/core";
import type { Detection, InjectionJudge, ProbeEvent } from "@injection-bisect/core";
import { Clock, Effect, Queue, Stream } from "effect";

type Finished =
  | { readonly type: "done"; readonly detection: Detection }
  | { readonly type: "failed"; readonly reason: string };

type InspectEvent = (ProbeEvent | Finished) & { readonly at: number };

const finish = ({
  text,
  model,
}: Readonly<{ text: string; model: string }>): Effect.Effect<Finished, never, InjectionJudge> =>
  detect(text, { model }).pipe(
    Effect.map((detection): Finished => ({ type: "done", detection })),
    Effect.catchTag("JudgeError", ({ reason }) =>
      Effect.succeed<Finished>({ type: "failed", reason }),
    ),
  );

const inspectEvents = ({
  text,
  apiKey,
  model,
}: Readonly<{ text: string; apiKey: string; model: string }>): AsyncIterable<InspectEvent> =>
  Stream.callback<InspectEvent, never, InjectionJudge>((queue) =>
    Effect.gen(function* emit() {
      const startedAt = yield* Clock.currentTimeMillis;
      const push = (event: ProbeEvent | Finished): Effect.Effect<void> =>
        Clock.currentTimeMillis.pipe(
          Effect.flatMap((now) => Queue.offer(queue, { ...event, at: now - startedAt })),
          Effect.asVoid,
        );
      const last = yield* finish({ text, model }).pipe(Effect.provideService(ProbeListener, push));
      yield* push(last);
      yield* Queue.end(queue);
    }).pipe(withApiKey(apiKey)),
  ).pipe(Stream.provide(openRouterPerRequest), Stream.toAsyncIterable);

export type { InspectEvent };
export { inspectEvents };
