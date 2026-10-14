import { Effect, Option } from "effect";
import { strFromU8, unzip } from "fflate";
import type { Unzipped } from "fflate";

import { ReadError } from "./read-error.ts";

interface Archive {
  readonly bytes: Uint8Array;
  readonly keep: (name: string) => boolean;
}

const failure = (cause: unknown): ReadError => new ReadError({ reason: String(cause) });

const settled = (cause: unknown, files: Unzipped): Effect.Effect<Unzipped, ReadError> =>
  Option.match(Option.fromNullishOr(cause), {
    onNone: () => Effect.succeed(files),
    onSome: (error) => Effect.fail(failure(error)),
  });

const unzipped = ({ bytes, keep }: Archive): Effect.Effect<Unzipped, ReadError> =>
  Effect.callback<Unzipped, ReadError>((resume) => {
    unzip(bytes, { filter: ({ name }) => keep(name) }, (cause, files) => {
      resume(settled(cause, files));
    });
  });

const textIn =
  (files: Unzipped) =>
  (name: string): string =>
    Option.match(Option.fromNullishOr(files[name]), {
      onNone: () => "",
      onSome: (file) => strFromU8(file),
    });

export { textIn, unzipped };
export type { Archive };
