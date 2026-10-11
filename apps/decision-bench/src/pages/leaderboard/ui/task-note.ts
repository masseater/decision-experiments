import type { TaskInfo } from "#/pages/leaderboard/model/ranking";
import { summary } from "#/pages/leaderboard/model/summary";
import type { LabelStats } from "#/pages/leaderboard/model/summary";

import { percent, usd } from "./format";
import { FORMAT_NAMES, METRIC_NAMES } from "./metric-names";

const goldNote = (stats: Readonly<LabelStats>): string => {
  if ("opusMatchesHuman" in stats) {
    return `正解は人のラベルで、Opus 5.5 のラベルとの一致率は ${percent(stats.opusMatchesHuman)}%（ラベル費用 ${usd(stats.opusCostUsd)}）です。`;
  }
  return `正解は Opus 5.5 が 3 回独立に答えて一致したものです（ラベル費用 ${usd(stats.opusCostUsd)}）。`;
};

const SPLIT_NOTE =
  "* は Choice を受け付けないモデルで、選択肢ごとの Noul を 1 回の呼び出しでまとめて聞き、「はい」の確率が最も高いものを答えにしています。";

const splitNote = (task: Readonly<TaskInfo>): readonly string[] => {
  if (task.format === "choice") {
    return [SPLIT_NOTE];
  }
  return [];
};

const taskNote = (task: Readonly<TaskInfo>): string =>
  [
    `${FORMAT_NAMES[task.format]} 形式で、raw は ${METRIC_NAMES[task.metric]} です。`,
    `test ${task.test.toLocaleString("ja-JP")} 件で採点し、Opus 5.5 の 3 回の答えが割れた hard ${task.hard.toLocaleString("ja-JP")} 件は別に集計しています。`,
    ...summary.labeling.filter((stats) => stats.task === task.task).map((stats) => goldNote(stats)),
    ...splitNote(task),
  ].join("");

export { taskNote };
