import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/reactivity";

type SortDirection = "asc" | "desc" | "none";

type Sort =
  | Readonly<{ status: "default" }>
  | Readonly<{ status: "sorted"; column: string; direction: "asc" | "desc" }>;

const DEFAULT_SORT: Sort = { status: "default" };

const sortAtom = Atom.family((_table: string) => Atom.make<Sort>(DEFAULT_SORT));

const nextSort = ({ current, column }: Readonly<{ current: Sort; column: string }>): Sort => {
  if (current.status === "default" || current.column !== column) {
    return { status: "sorted", column, direction: "desc" };
  }
  if (current.direction === "desc") {
    return { status: "sorted", column, direction: "asc" };
  }
  return DEFAULT_SORT;
};

const directionOf = ({ sort, column }: Readonly<{ sort: Sort; column: string }>): SortDirection => {
  if (sort.status === "default" || sort.column !== column) {
    return "none";
  }
  return sort.direction;
};

const useSort = (table: string): Sort => useAtomValue(sortAtom(table));

const useSortDirection = ({
  table,
  column,
}: Readonly<{ table: string; column: string }>): SortDirection =>
  directionOf({ sort: useSort(table), column });

const useToggleSort = ({
  table,
  column,
}: Readonly<{ table: string; column: string }>): (() => void) => {
  const current = useSort(table);
  const set = useAtomSet(sortAtom(table));
  return () => {
    set(nextSort({ current, column }));
  };
};

export { useSort, useSortDirection, useToggleSort };
export type { Sort, SortDirection };
