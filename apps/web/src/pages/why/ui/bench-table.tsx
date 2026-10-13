import type { ReactNode } from "react";

import { BenchBody } from "./bench-body";
import { BenchHead } from "./bench-head";

const BenchTable = (): ReactNode => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <BenchHead />
      <BenchBody />
    </table>
  </div>
);

export { BenchTable };
