type ChartRow =
  | Readonly<{ status: "measured"; key: string; label: string; ratio: number; value: string }>
  | Readonly<{ status: "unsupported"; key: string; label: string; note: string }>;

export type { ChartRow };
