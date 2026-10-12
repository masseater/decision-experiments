import {
  DEFAULT_BRANCHES,
  DEFAULT_CUTOFF,
  DEFAULT_MODEL,
  PRODUCT_NAME,
} from "@injection-bisect/core";

const COPY = {
  title: PRODUCT_NAME,
  mechanism: "仕組み",
  steps: [
    `文章全体を ${DEFAULT_MODEL} に1回問い合わせ、インジェクションを含む確率を受け取る`,
    `${DEFAULT_CUTOFF} 未満なら終わる`,
    `${DEFAULT_CUTOFF} 以上なら文の切れ目で${DEFAULT_BRANCHES}つに分け、別々のリクエストで同時に問い合わせる`,
    `${DEFAULT_CUTOFF} 以上の区間だけを、1文になるまで同じように分ける`,
  ],
  cost: `問い合わせはおよそ 1 + ${DEFAULT_BRANCHES}·log${DEFAULT_BRANCHES}n 回、往復は log${DEFAULT_BRANCHES}n 段`,
  separate:
    "1リクエストに全区間を並べると注入より後ろの文まで陽性になるため、区間ごとに別リクエストにする",
  question: "判定モデルへの質問",
  examples: "例",
  apiKey: "OpenRouter API キー",
  keyNote: "キーは openrouter.ai にだけ送ります",
  submit: "インジェクションを探す",
  running: "探しています",
  clean: "インジェクションなし",
  injected: "インジェクションあり",
  failed: "失敗しました",
  queries: "問い合わせ",
  perSentence: "1文ずつなら",
  times: "回",
  elapsed: "経過",
  tokens: "入力トークン",
  spent: "費用",
  trace: "問い合わせの流れ",
  log: "ログ",
  depth: "段",
  chars: "字",
  over: `≥ ${DEFAULT_CUTOFF}`,
  under: `< ${DEFAULT_CUTOFF}`,
  regions: "注入箇所",
  legendHit: `${DEFAULT_CUTOFF} 以上`,
  legendMiss: `${DEFAULT_CUTOFF} 未満`,
  legendPending: "応答待ち",
} as const;

export { COPY };
