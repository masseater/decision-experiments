import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Line } from "./line";

const LimitLine = ({ text }: Readonly<{ text: string }>): ReactNode => (
  <Line text={text}>
    <Info />
  </Line>
);

export { LimitLine };
