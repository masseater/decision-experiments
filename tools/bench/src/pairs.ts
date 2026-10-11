import { Array as Arr } from "effect";

import type { Scored } from "./score.ts";
import type { TaskResult } from "./summary.ts";

const PAIR_MEMBER = /-\d+[ab]$/u;
const PAIR_SIZE = 2;
const CORRECT = 1;
const NONE = 0;
const SIDE_LENGTH = 1;

const pairOf = ({ item }: Readonly<Scored>): string => item.id.slice(NONE, -SIDE_LENGTH);

const pairAccuracyOf = ({
  rows,
  credit,
}: Readonly<{
  rows: readonly Scored[];
  credit: (row: Readonly<Scored>) => number;
}>): TaskResult["test"]["pairs"] => {
  const members = rows.filter(({ item }) => PAIR_MEMBER.test(item.id));
  const pairs = Object.values(Arr.groupBy(members, pairOf)).filter(
    (pair) => pair.length === PAIR_SIZE,
  );
  if (pairs.length === NONE) {
    return { status: "unavailable" };
  }
  const solved = pairs.filter((pair) => pair.every((row) => credit(row) === CORRECT));
  return { status: "measured", accuracy: solved.length / pairs.length, count: pairs.length };
};

export { pairAccuracyOf };
