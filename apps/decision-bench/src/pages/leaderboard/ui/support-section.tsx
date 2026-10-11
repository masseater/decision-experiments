import type { ReactNode } from "react";

import { Section } from "./section";
import { SupportTable } from "./support-table";

const NOTE =
  "未対応は、モデルがその形式（Choice / Noul）の問いを受け付けなかったものです。失敗は、受け付けたうえでエラーや形式違いの答えが返った割合です。";

const SupportSection = (): ReactNode => (
  <Section id="support" title="対応形式と失敗率" note={NOTE}>
    <SupportTable />
  </Section>
);

export { SupportSection };
