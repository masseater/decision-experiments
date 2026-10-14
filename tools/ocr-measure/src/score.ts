import type { FieldValue, INVOICE_FIELDS } from "@r_masseater/ocr-decide";
import { Array as Arr, Equivalence, Option } from "effect";

type FieldId = (typeof INVOICE_FIELDS)[number]["id"];

const REIWA_OFFSET = 2018;

const DATE_PARTS = 3;

const YEAR_PART = 1;

const compact = (text: string): string => text.normalize("NFKC").replaceAll(/\s/gu, "");

const numbersOf = (text: string): readonly number[] =>
  Array.from(compact(text).matchAll(/\d+/gu), ([run]) => Number(run));

const amountsOf = (text: string): readonly number[] =>
  numbersOf(compact(text).replaceAll(/(?<=\d)[,.](?=\d{3})/gu, ""));

const yearsOf = (year: number): readonly number[] => [
  year,
  year + REIWA_OFFSET,
  year - REIWA_OFFSET,
];

const sameNumbers = Arr.makeEquivalence(Equivalence.Number);

const sameDate = (window: readonly number[], expected: readonly number[]): boolean =>
  Option.all([Arr.head(window), Arr.head(expected)]).pipe(
    Option.exists(
      ([first, year]) =>
        yearsOf(year).includes(first) &&
        sameNumbers(Arr.drop(window, YEAR_PART), Arr.drop(expected, YEAR_PART)),
    ),
  );

const containsDate = (answer: string, truth: string): boolean => {
  const expected = Arr.take(numbersOf(truth), DATE_PARTS);
  const numbers = numbersOf(answer);
  return (
    expected.length === DATE_PARTS &&
    [...numbers.keys()].some((start) =>
      sameDate(numbers.slice(start, start + DATE_PARTS), expected),
    )
  );
};

const containsAmount = (answer: string, truth: string): boolean =>
  Arr.head(amountsOf(truth)).pipe(Option.exists((amount) => amountsOf(answer).includes(amount)));

const matches = (field: FieldId, answer: string, truth: string): boolean => {
  if (field === "issueDate") {
    return containsDate(answer, truth);
  }
  if (field === "total" || field === "tax") {
    return containsAmount(answer, truth);
  }
  return compact(answer).includes(compact(truth));
};

const isCorrect = ({
  field,
  value,
  truth,
}: Readonly<{ field: FieldId; value: FieldValue; truth: string }>): boolean =>
  value.status === "found" && matches(field, value.text, truth);

export { isCorrect };
export type { FieldId };
