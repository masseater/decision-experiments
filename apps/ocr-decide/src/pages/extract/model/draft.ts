import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/reactivity";

import { DIRECT } from "./ways";

type Picture =
  | { readonly status: "none" }
  | { readonly status: "loading"; readonly name: string }
  | { readonly status: "failed"; readonly name: string; readonly reason: string }
  | {
      readonly status: "ready";
      readonly name: string;
      readonly bytes: Uint8Array;
      readonly url: string;
    };

const NO_PICTURE: Picture = { status: "none" };

const pictureAtom = Atom.make<Picture>(NO_PICTURE);

const apiKeyAtom = Atom.make("");

const wayAtom = Atom.make(DIRECT.key);

const usePicture = (): Picture => useAtomValue(pictureAtom);

const useSetPicture = (): ((picture: Picture) => void) => useAtomSet(pictureAtom);

const useApiKey = (): string => useAtomValue(apiKeyAtom);

const useSetApiKey = (): ((apiKey: string) => void) => useAtomSet(apiKeyAtom);

const useWay = (): string => useAtomValue(wayAtom);

const useSetWay = (): ((way: string) => void) => useAtomSet(wayAtom);

export type { Picture };
export { useApiKey, usePicture, useSetApiKey, useSetPicture, useSetWay, useWay };
