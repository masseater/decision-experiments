const UNANIMOUS = 1;

const LABEL_CONCURRENCY = 4;

const splitOf = (agreement: number): "test" | "hard" => {
  if (agreement === UNANIMOUS) {
    return "test";
  }
  return "hard";
};

export { LABEL_CONCURRENCY, splitOf };
