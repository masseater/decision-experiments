import reference from "#docs/haiku-reference.md?raw";

const COLUMNS = 10;

const INDEX = 1;

const RESULT = 4;

const SECONDS = 5;

const DOLLARS = 8;

const MS_PER_SECOND = 1000;

const HALF = 2;

const NONE = 0;

const ONE = 1;

const rows = reference
  .split("\n")
  .map((line) => line.split("|").map((cell) => cell.trim()))
  .filter((cells) => cells.length === COLUMNS && /^\d+$/u.test(cells[INDEX] ?? ""));

const resultOf = (cells: readonly string[]): string => cells[RESULT] ?? "";

const numberAt = (cells: readonly string[], index: number): number => Number(cells[index]);

const sorted = rows
  .map((cells) => numberAt(cells, SECONDS))
  .toSorted((left, right) => left - right);

const HAIKU_REFERENCE = {
  missed: rows.filter((cells) => resultOf(cells).includes("見逃し")).length,
  falseAlarms: rows.filter((cells) => resultOf(cells).includes("誤検知")).length,
  located: rows.filter((cells) => resultOf(cells).includes("一致")).length,
  medianMs: Math.round((sorted[Math.floor(sorted.length / HALF)] ?? NONE) * MS_PER_SECOND),
  dollarsPerText:
    rows.reduce((sum, cells) => sum + numberAt(cells, DOLLARS), NONE) / Math.max(rows.length, ONE),
};

export { HAIKU_REFERENCE };
