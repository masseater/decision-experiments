type ChartRow =
  | Readonly<{
      status: "interval";
      key: string;
      label: string;
      ratio: number;
      interval: Readonly<{ lower: number; upper: number }>;
    }>
  | Readonly<{ status: "point"; key: string; label: string; ratio: number }>
  | Readonly<{ status: "unsupported"; key: string; label: string }>;

export type { ChartRow };
