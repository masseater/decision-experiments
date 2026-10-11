import { tasks } from "#/pages/leaderboard/model/ranking";
import type { TaskInfo } from "#/pages/leaderboard/model/ranking";

type TaskRoute = Readonly<{ info: TaskInfo; params: Readonly<{ task: string }> }>;

const taskRoutes: readonly TaskRoute[] = tasks.map((info) => ({
  info,
  params: { task: info.task },
}));

export { taskRoutes };
