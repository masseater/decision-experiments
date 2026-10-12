import { DEFAULT_CUTOFF, DEFAULT_MODEL, PRODUCT_NAME } from "@injection-bisect/core";

const COPY = {
  title: PRODUCT_NAME,
  lead: "フロンティアモデルに渡す前の文章を、安い判定モデルに二分探索で問い合わせ、プロンプトインジェクションがあるか、どこにあるかを探します。",
  mechanism: "仕組み",
  steps: [
    `文章全体を判定モデル（${DEFAULT_MODEL}）に1回だけ問い合わせ、インジェクションを含む確率を受け取ります。`,
    `${DEFAULT_CUTOFF} 未満なら、そこで終わりです。無害な文章は1回の問い合わせで済みます。`,
    `${DEFAULT_CUTOFF} 以上なら、文の切れ目で前半と後半に分け、別々のリクエストで同時に問い合わせます。`,
    `${DEFAULT_CUTOFF} 以上だった側だけをさらに半分にします。1文まで絞れたら、そこが注入箇所です。どちらの半分も ${DEFAULT_CUTOFF} 未満なら、文をまたぐ注入とみなして分ける前の区間を返します。`,
  ],
  cost: "n 文に注入が1か所なら、問い合わせはおよそ 1 + 2·log₂n 回、待ち時間は log₂n 往復ぶんです。区間ごとに別のリクエストにしているのは、1回のリクエストで全部の区間を判定させると、注入より後ろの無害な文まで高い確率になり、場所を絞れなかったためです。",
  question: "判定モデルへの質問",
  apiKey: "OpenRouter API キー",
  keyNote:
    "キーはこのブラウザから openrouter.ai に直接送ります。このサイトのサーバーには送りません。",
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
  asked: "問い合わせ",
  answered: "応答",
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
