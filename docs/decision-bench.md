# mst-ja-decision-bench

選択・二値・スコアだけを返す decision model を、日本語のタスクで測るベンチマークである。
結果は https://mst-ja-decision-bench.masseater.dev で公開する。

- 正解ラベルは Claude Opus 5.5 だけで付けた。
- スコアは Opus 5.5 のラベルとの一致率で、本当の正しさではない。
- 勉強目的の実験なので、結果を過信しないでほしい。

JNLI だけは人が付けた正解を使う。
Opus 5.5 のラベルは、人の正解との一致率を「LLM ラベルの誤り率の目安」として示すためにだけ使う。

## 結果

`tools/bench` の `vp run bench` が次の表を生成する。
Opus 5.5 はラベルの付け手なので、リーダーボードには並べない。
span-01 lite は Noul しか受け付けないため、JNLI（Choice）は全問が未対応の失敗になり、指数を下げている。

<!-- results:start -->

| モデル       | 指数 | タスク                  | skill（test） | raw（test） |      失敗 | p50 / p95 (ms) | 1,000 判定あたり (USD) |
| ------------ | ---: | ----------------------- | ------------: | ----------: | --------: | -------------: | ---------------------: |
| span-01 lite | 23.1 | JNLI 含意関係（Choice） |           0.0 |         0.0 | 2424/2424 |        60 / 82 |                 0.0000 |
| span-01 lite | 23.1 | 業務ルール判定（Noul）  |          46.2 |        73.1 |     0/200 |      198 / 373 |                 0.0000 |

| タスク | 件数 | hard | Opus 5.5 のラベル費用 (USD) | Opus 5.5 と人の正解の一致率 |
| ------ | ---: | ---: | --------------------------: | --------------------------: |
| jnli   | 2434 |   10 |                        6.69 |                       91.5% |
| rules  |  200 |    0 |                        8.46 |                           - |

<!-- results:end -->

## タスク

| タスク         | 種類   | 件数 | 正解     | 出典とライセンス                                                   |
| -------------- | ------ | ---: | -------- | ------------------------------------------------------------------ |
| JNLI 含意関係  | Choice | 2434 | 人       | JGLUE JNLI v1.3 の valid（yahoojapan/JGLUE@6f071c0）、CC BY-SA 4.0 |
| 業務ルール判定 | Noul   |  200 | Opus 5.5 | Opus 5.5 で生成した架空の社内規程と事例、CC BY-SA 4.0              |

データは `tools/bench/data` に JSONL で置く。
1 件ごとに `id / type / text / criteria / options / gold / gold_source / agreement / source / license / split` を持つ。
`text` は System One API の `state`、`criteria` は `instructions`、`options` は `criteria` にそのまま渡す。

JNLI は valid 2,434 件をすべて使う。
正解は人が付けたものなので、Opus 5.5 のラベルは `sentence_pair_id` の SHA-256 順で先頭 200 件にだけ付け、人の正解との一致率を出すのに使う。
業務ルール判定は、20 のテーマごとに Opus 5.5 で規程・事例・基準文を 10 件ずつ生成した。

## 正解ラベルの付け方

1 問ごとに `claude -p --model claude-opus-5-5` を構造化出力（`--json-schema`）で 3 回独立に呼ぶ。
3 回とも一致した問題を `split: test`、割れた問題を `split: hard` にし、最多の答えの割合を `agreement` に記録する。
Opus 5.5 に聞いていない JNLI の問題は `split: test` にし、`agreement` を持たない。
応答は Effect の `PersistedCache` で `tools/bench/cache` に 1 件 1 ファイルで保存するので、再実行しても呼び直さない。

## 採点

採点は Jev Decision Index のルールに合わせる。

- 問題文は全モデルで同じにし、モデルごとに調整しない。
- 棄権・エラー・未対応の形式は不正解として数える。
- Choice は正解率、Noul は 0.5 を閾値にした balanced accuracy、Score は normalized MAE を 1 から引いた値を raw とする。
- skill は `(raw - chance) / (1 - chance)` を 0〜1 に収めた値である。chance はランダムに答えたときの期待値で、Choice は選択肢数の逆数、Noul は 0.5 である。
- 指数は各タスクの test split の skill の平均である。
- latency の p50・p95 と、1,000 判定あたりのコストも記録する。

モデルの呼び出しは OpenRouter の SDK（`@openrouter/sdk` の `systemOne.create`）に一本化している。
OpenRouter の応答もキャッシュし、成功した判定は再実行で呼び直さない。

## 実行

```sh
vp install
cd tools/bench
JNLI_VALID_JSON=<JGLUE を clone した場所>/datasets/jnli-v1.3/valid-v1.3.json vp run build:jnli
vp run build:rules
OPENROUTER_API_KEY=... vp run bench
```

## 開発

このリポジトリは masseater/typescript-template から作った。
検証は `vp run verify` で行う。

リポジトリの Actions secrets に次を登録する。

| 名前                      | 用途                                       |
| ------------------------- | ------------------------------------------ |
| `OPENROUTER_API_KEY`      | verify ワークフローの jev-lint             |
| `CLAUDE_CODE_OAUTH_TOKEN` | verify 失敗時に Claude Code が自動修正する |
| `CLOUDFLARE_ACCOUNT_ID`   | ダッシュボードのデプロイ                   |
| `CLOUDFLARE_API_TOKEN`    | ダッシュボードのデプロイ                   |

Cloudflare の認証情報は、手元の環境変数に置かず、Alchemy のプロファイル（`~/.alchemy`）で管理する。
