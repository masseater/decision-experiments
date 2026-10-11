import type { TaskResult } from "#/pages/leaderboard/model/summary";

const METRIC_NAMES: Readonly<Record<TaskResult["metric"], string>> = {
  "macro-f1": "macro-F1",
  "balanced-accuracy": "balanced accuracy",
  "normalized-mae": "1 - normalized MAE",
};

const FORMAT_NAMES: Readonly<Record<TaskResult["format"], string>> = {
  choice: "Choice",
  noul: "Noul",
  score: "Score",
};

export { FORMAT_NAMES, METRIC_NAMES };
