import { detect } from "@injection-bisect/core";
import type { Detection, InjectionJudge } from "@injection-bisect/core";
import { Duration, Effect, Schema } from "effect";

import { MAX_CHARS, MODEL_CHOICES, MODELS } from "#/pages/inspect/model/models";
import type { ModelChoice } from "#/pages/inspect/model/models";
import { createRouter } from "#/shared/api/index.server";

import { runRequest } from "./runtime.server";

type InspectResponse =
  | (Detection & { readonly millis: number })
  | { readonly status: "failed"; readonly reason: string };

const InspectRequest = Schema.Struct({
  text: Schema.String.check(Schema.isNonEmpty(), Schema.isMaxLength(MAX_CHARS)),
  model: Schema.Literals(MODEL_CHOICES),
});

const inspectBody = Schema.toStandardSchemaV1(InspectRequest);

const inspect = Effect.fn("inspect.request")(function* inspect(text: string, model: ModelChoice) {
  const [elapsed, detection] = yield* Effect.timed(detect(text, { model: MODELS[model] }));
  yield* Effect.logInfo("inspected").pipe(
    Effect.annotateLogs({
      model,
      chars: text.length,
      status: detection.status,
      probes: detection.probes.length,
    }),
  );
  return { ...detection, millis: Duration.toMillis(elapsed) };
});

const respond = (
  text: string,
  model: ModelChoice,
): Effect.Effect<InspectResponse, never, InjectionJudge> =>
  inspect(text, model).pipe(
    Effect.catchTag("JudgeError", ({ reason }) =>
      Effect.succeed({ status: "failed", reason } as const),
    ),
  );

const inspectRoutes = createRouter("/api/inspect").post(
  "/",
  ({ body }) => runRequest(respond(body.text, body.model)),
  { body: inspectBody },
);

type InspectRoutes = typeof inspectRoutes;

export type { InspectResponse, InspectRoutes };
export { inspectRoutes };
