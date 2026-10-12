const COPY = {
  title: "injection-bisect",
  lead: "入力にプロンプトインジェクションが含まれるかを decision モデルで判定し、含まれていれば前半と後半に分けて問い直して場所を絞り込みます。",
  submit: "判定する",
  idle: "「判定する」を押すと、判定結果と、問い合わせごとの確率・時間・費用が出ます。",
  pending: "判定しています…",
  failed: "判定に失敗しました: ",
  clean: "インジェクションは見つかりませんでした",
  injected: "インジェクションを含みます",
  requests: "問い合わせ",
  times: "回",
  separator: "・",
  slash: " / ",
} as const;

export { COPY };
