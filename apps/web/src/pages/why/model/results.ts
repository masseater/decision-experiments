const ROWS = [
  { label: "注入ありの文書 19 本のうち、見つけた本数", ours: "19 本", direct: "19 本" },
  { label: "注入なしの文書 6 本のうち、誤って注入ありとした本数", ours: "0 本", direct: "0 本" },
  { label: "文書 1 本の判定にかかった時間（中央値）", ours: "0.4 秒", direct: "1.4 秒" },
  { label: "文書 1 本あたりの費用", ours: "$0.00015", direct: "$0.00011" },
  { label: "判定する側が、注入された指示に従う余地", ours: "なし", direct: "あり" },
] as const;

type Row = (typeof ROWS)[number];

export { ROWS };
export type { Row };
