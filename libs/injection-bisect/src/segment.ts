interface Span {
  readonly start: number;
  readonly end: number;
}

const FIRST = 0;

const SENTENCE = /(?:[^\n。．！？.!?]|[.!?](?!\s|$))+[。．！？.!?]*[^\S\n]*\n*/gu;

const spanOf = (sentence: string, index: number): readonly Span[] => {
  if (sentence.trim() === "") {
    return [];
  }
  return [{ start: index, end: index + sentence.length }];
};

const sentencesOf = (text: string): readonly Span[] =>
  [...text.matchAll(SENTENCE)].flatMap((match) => spanOf(match[FIRST], match.index));

export { sentencesOf };
export type { Span };
