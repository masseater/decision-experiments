import type { ReactNode } from "react";

const NOTES = [
  "正解ラベルは Claude Opus 5.5 だけで付けました（JNLI は人の正解を使い、Opus 5.5 のラベルは誤り率の目安にだけ使っています）。",
  "スコアは Opus 5.5 のラベルとの一致率で、本当の正しさではありません。",
  "勉強目的の実験なので、結果を過信しないでください。",
];

const Disclaimer = (): ReactNode => (
  <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
    {NOTES.map((note) => (
      <li key={note}>{note}</li>
    ))}
  </ul>
);

export { Disclaimer };
