import type { ModelResult, TaskResult } from "./summary";

const SPLIT_MARK = "*";

const displayLabel = ({
  model,
  result,
}: Readonly<{ model: ModelResult; result: TaskResult }>): string => {
  if (model.choiceVia === "noul" && result.format === "choice") {
    return `${model.label}${SPLIT_MARK}`;
  }
  return model.label;
};

export { displayLabel };
