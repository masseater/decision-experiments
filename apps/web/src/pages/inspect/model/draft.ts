import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { DEFAULT_MODEL } from "@r_masseater/injection-bisect";
import { Atom } from "effect/reactivity";

import { EXAMPLES } from "./examples";

type Run =
  | { readonly status: "idle" }
  | {
      readonly status: "started";
      readonly id: number;
      readonly text: string;
      readonly apiKey: string;
      readonly model: string;
    };

type Focus = { readonly status: "none" } | { readonly status: "probe"; readonly id: number };

const IDLE: Run = { status: "idle" };

const NO_FOCUS: Focus = { status: "none" };

const [FIRST_EXAMPLE] = EXAMPLES;

const draftTextAtom = Atom.make(FIRST_EXAMPLE.text);

const apiKeyAtom = Atom.make("");

const modelAtom = Atom.make<string>(DEFAULT_MODEL);

const runAtom = Atom.make<Run>(IDLE);

const focusAtom = Atom.make<Focus>(NO_FOCUS);

const useDraftText = (): string => useAtomValue(draftTextAtom);

const useSetDraftText = (): ((text: string) => void) => useAtomSet(draftTextAtom);

const useApiKey = (): string => useAtomValue(apiKeyAtom);

const useSetApiKey = (): ((apiKey: string) => void) => useAtomSet(apiKeyAtom);

const useModel = (): string => useAtomValue(modelAtom);

const useSetModel = (): ((model: string) => void) => useAtomSet(modelAtom);

const useRun = (): Run => useAtomValue(runAtom);

const useSetRun = (): ((run: Run) => void) => useAtomSet(runAtom);

const useFocus = (): Focus => useAtomValue(focusAtom);

const useSetFocus = (): ((focus: Focus) => void) => useAtomSet(focusAtom);

export type { Focus, Run };
export {
  NO_FOCUS,
  useApiKey,
  useDraftText,
  useFocus,
  useModel,
  useRun,
  useSetApiKey,
  useSetDraftText,
  useSetFocus,
  useSetModel,
  useSetRun,
};
