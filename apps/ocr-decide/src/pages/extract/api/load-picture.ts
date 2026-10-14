import { Effect, ManagedRuntime } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";

import type { Picture } from "#/pages/extract/model/draft";

const runtime = ManagedRuntime.make(FetchHttpClient.layer);

interface OpenRequest {
  readonly name: string;
  readonly url: string;
  readonly done: (picture: Picture) => void;
}

const pictureOf = ({
  name,
  url,
}: OpenRequest): Effect.Effect<Picture, never, HttpClient.HttpClient> =>
  HttpClient.get(url).pipe(
    Effect.flatMap((response) => response.arrayBuffer),
    Effect.match({
      onFailure: (error): Picture => ({ status: "failed", name, reason: error.message }),
      onSuccess: (buffer): Picture => ({
        status: "ready",
        name,
        bytes: new Uint8Array(buffer),
        url,
      }),
    }),
  );

const openPicture = (request: OpenRequest): void => {
  runtime.runFork(
    pictureOf(request).pipe(
      Effect.tap((picture) =>
        Effect.sync(() => {
          request.done(picture);
        }),
      ),
    ),
  );
};

export { openPicture };
