import { Effect, Layer, Logger, ManagedRuntime } from "effect";

import { cloudflareLogger, withCloudflareTracing } from "./tracing.server";

type RunRequest<Services> = <Success>(
  effect: Effect.Effect<Success, never, Services>,
) => Promise<Success>;

const makeRunRequest = <Services, LayerError>(
  layer: Layer.Layer<Services, LayerError>,
): RunRequest<Services> => {
  const runtime = ManagedRuntime.make(Layer.mergeAll(layer, Logger.layer([cloudflareLogger])));
  return (effect) =>
    effect.pipe(
      Effect.tapCause((cause) => Effect.logError("request failed", cause)),
      withCloudflareTracing,
      (traced) => runtime.runPromise(traced),
    );
};

export type { RunRequest };
export { makeRunRequest };
