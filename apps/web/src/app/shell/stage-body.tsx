import { SiteStage } from "@decision-experiments/web-ui";
import { RegistryProvider } from "@effect/atom-react";
import type { ReactNode } from "react";

const StageBody = ({ children }: Readonly<{ children: ReactNode }>): ReactNode => (
  <RegistryProvider>
    <SiteStage>{children}</SiteStage>
  </RegistryProvider>
);

export { StageBody };
