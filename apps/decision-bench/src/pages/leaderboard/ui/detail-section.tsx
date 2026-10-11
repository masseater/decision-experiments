import type { ReactNode } from "react";

import { tasks } from "#/pages/leaderboard/model/ranking";

import { DetailTable } from "./detail-table";
import { Section } from "./section";

const NOTE = "グラフの元になった数値です。費用は OpenRouter が返した実費（USD）です。";

const DetailSection = (): ReactNode => (
  <Section id="detail" title="全数値" note={NOTE}>
    {tasks.map((task) => (
      <DetailTable key={task.task} task={task.task} label={task.label} />
    ))}
  </Section>
);

export { DetailSection };
