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

<!-- results:start -->

| モデル       | 指数（参考） |
| ------------ | -----------: |
| span-01 lite |         25.9 |

### JNLI 含意関係（choice、raw は macro-f1）

正解ラベル: 2434 件（hard 10 件）、Opus 5.5 のラベル費用 6.69 USD、Opus 5.5 と人の正解の一致率 91.5%。

| モデル       | skill |  raw | 正解率 | coverage | p50 / p95 (ms) | 1,000 判定あたり (USD) |
| ------------ | ----: | ---: | -----: | -------: | -------------: | ---------------------: |
| span-01 lite |  10.9 | 38.7 |   48.8 |    100.0 |      189 / 336 |                 0.0000 |

### 業務ルール判定（noul、raw は balanced-accuracy）

正解ラベル: 500 件（hard 2 件）、Opus 5.5 のラベル費用 22.22 USD、Opus 5.5 と人の正解の一致率 -。

| モデル       | skill |  raw | 正解率 | coverage | p50 / p95 (ms) | 1,000 判定あたり (USD) |
| ------------ | ----: | ---: | -----: | -------: | -------------: | ---------------------: |
| span-01 lite |  40.9 | 70.4 |   70.5 |    100.0 |      198 / 361 |                 0.0000 |

<!-- results:end -->

## タスク

| タスク         | 種類   | 件数 | 正解     | 出典とライセンス                                                   |
| -------------- | ------ | ---: | -------- | ------------------------------------------------------------------ |
| JNLI 含意関係  | Choice | 2434 | 人       | JGLUE JNLI v1.3 の valid（yahoojapan/JGLUE@6f071c0）、CC BY-SA 4.0 |
| 業務ルール判定 | Noul   |  500 | Opus 5.5 | Opus 5.5 で生成した架空の社内規程と事例、CC BY-SA 4.0              |

データは `tools/bench/data` に JSONL で置く。
1 件ごとに `id / type / text / criteria / options / gold / gold_source / agreement / source / license / split` を持つ。
`text` は System One API の `state`、`criteria` は `instructions`、`options` は `criteria` にそのまま渡す。

JNLI は valid 2,434 件をすべて使う。
正解は人が付けたものなので、Opus 5.5 のラベルは `sentence_pair_id` の SHA-256 順で先頭 200 件にだけ付け、人の正解との一致率を出すのに使う。
業務ルール判定は、25 のテーマごとに Opus 5.5 で規程・事例・基準文を 10 件ずつ 2 組生成した。
2 組目には 1 組目の基準文を渡し、同じ論点を繰り返さないよう指示した。

## 正解ラベルの付け方

1 問ごとに `claude -p --model claude-opus-5-5` を構造化出力（`--json-schema`）で 3 回独立に呼ぶ。
3 回とも一致した問題を `split: test`、割れた問題を `split: hard` にし、最多の答えの割合を `agreement` に記録する。
Opus 5.5 に聞いていない JNLI の問題は `split: test` にし、`agreement` を持たない。
応答は Effect の `PersistedCache` で `tools/bench/cache` に 1 件 1 ファイルで保存するので、再実行しても呼び直さない。

## 採点

採点は Jev Decision Index のルールに合わせる。

- 問題文は全モデルで同じにし、モデルごとに調整しない。
- Noul しか受け付けないモデル（span-01 系）には、Choice の問題を選択肢ごとの Noul に分けて 1 回の呼び出しで聞き、「はい」の確率が最も高い選択肢を答えとする。同じ確率の選択肢が並んだときは、選択肢の並び順で先のものを選ぶ。結果では、この方法で答えたモデルに「*」を付ける。
- 棄権・エラー・未対応の形式は不正解として数える。
- Choice は macro-F1、Noul は 0.5 を閾値にした balanced accuracy、Score は normalized MAE を 1 から引いた値を raw とする。Decision Index も NLI 系（ANLI など）を macro-F1 で採点している。
- skill は `(raw - chance) / (1 - chance)` を 0〜1 に収めた値である。chance はランダムに答えたときの期待値で、Choice は一様に選んだときの各ラベルの F1 の平均、Noul は 0.5 である。
- 指数は各タスクの test split の skill の平均である。性質の違うタスクをまたぐ参考値なので、ページではタスクごとの枠とは分けて示す。
- latency の p50・p95 と、1,000 判定あたりのコストも記録する。

答えられた問題の割合は coverage として別に示す。
確率からは ECE（信頼度 10 区間）と Brier（全選択肢の二乗誤差の和）を出す。
Noul は「はい」の確率を、Choice は返された確率分布を使う。

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
