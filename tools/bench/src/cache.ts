import { Duration, Effect, Exit, Layer } from "effect";
import type { Crypto, Schema } from "effect";
import { KeyValueStore, PersistedCache, Persistable, Persistence } from "effect/persistence";

import { benchPath, sha256 } from "./store.ts";

type Cached<Value> = (key: unknown, compute: Effect.Effect<Value>) => Effect.Effect<Value>;

const keepWhen = (keep: boolean): Duration.Duration => {
  if (keep) {
    return Duration.infinity;
  }
  return Duration.zero;
};

const makeCache = Effect.fn("makeCache")(function* makeCache<
  Codec extends Schema.Codec<unknown, unknown>,
>(storeId: string, success: Codec, keep: (value: Codec["Type"]) => boolean) {
  const crypto = yield* Effect.context<Crypto.Crypto>();
  const directory = yield* benchPath("cache");
  const store = KeyValueStore.layerFileSystem(directory);
  const persistence = yield* Layer.build(Persistence.layerKvs.pipe(Layer.provide(store)));
  const Call = Persistable.Class<{
    payload: { key: string; compute: Effect.Effect<Codec["Type"]> };
  }>()(storeId, { primaryKey: ({ key }) => key, success });
  const cache = yield* PersistedCache.make<InstanceType<typeof Call>>((call) => call.compute, {
    storeId: `${storeId}-`,
    timeToLive: (exit) => keepWhen(Exit.isSuccess(exit) && keep(exit.value)),
  }).pipe(Effect.provideContext(persistence));
  const cached: Cached<Codec["Type"]> = (key, compute) =>
    sha256(key).pipe(
      Effect.flatMap((hash) => cache.get(new Call({ key: hash, compute }))),
      Effect.provideContext(crypto),
      Effect.orDie,
    );
  return cached;
});

export { makeCache };
