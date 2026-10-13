import type { ReactNode } from "react";

const Stat = ({ label, value }: Readonly<{ label: string; value: string }>): ReactNode => (
  <div className="flex flex-col gap-1 rounded-lg border p-5">
    <dt className="text-muted-foreground text-sm">{label}</dt>
    <dd className="font-mono text-3xl font-bold">{value}</dd>
  </div>
);

export { Stat };
