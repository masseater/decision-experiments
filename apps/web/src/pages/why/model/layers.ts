import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/reactivity";

const PERCENT = 100;

const INITIAL_BACK = 99;

const INITIAL_FRONT = 95;

const backAtom = Atom.make(INITIAL_BACK);

const frontAtom = Atom.make(INITIAL_FRONT);

const useBack = (): number => useAtomValue(backAtom);

const useSetBack = (): ((percent: number) => void) => useAtomSet(backAtom);

const useFront = (): number => useAtomValue(frontAtom);

const useSetFront = (): ((percent: number) => void) => useAtomSet(frontAtom);

const leakOf = (blocked: readonly number[]): number =>
  blocked.reduce((leak, percent) => leak * (PERCENT - percent), PERCENT) /
  PERCENT ** blocked.length;

export { PERCENT, leakOf, useBack, useFront, useSetBack, useSetFront };
