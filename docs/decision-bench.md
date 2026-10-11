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

| モデル       | 指数（参考） | 全タスクの費用 (USD) |
| ------------ | -----------: | -------------------: |
| Jev 1.13     |         64.0 |               0.0826 |
| span-01 lite |         11.6 |               0.0000 |

### JNLI 含意関係（choice、raw は macro-f1）

正解ラベル: 2434 件（hard 10 件）、Opus 5.5 のラベル費用（API 換算） 6.69 USD、Opus 5.5 と人の正解の一致率 91.5%。

| モデル       |  skill（95% 区間） |  raw | 正解率 | 対の正解率（95% 区間） | coverage | p50 / p95 (ms) | タスク全体の費用 (USD) |
| ------------ | -----------------: | ---: | -----: | ---------------------: | -------: | -------------: | ---------------------: |
| Jev 1.13     | 73.1（70.5〜75.7） | 81.5 |   83.4 |                      - |    100.0 |      169 / 254 |                 0.0473 |
| span-01 lite |  10.9（7.8〜14.1） | 38.7 |   48.8 |                      - |    100.0 |      189 / 336 |                 0.0000 |

### 業務ルール判定（noul、raw は balanced-accuracy）

正解ラベル: 500 件（hard 3 件）、Opus 5.5 のラベル費用（API 換算） 31.19 USD、Opus 5.5 と人の正解の一致率 -。

| モデル       |  skill（95% 区間） |  raw | 正解率 | 対の正解率（95% 区間） | coverage | p50 / p95 (ms) | タスク全体の費用 (USD) |
| ------------ | -----------------: | ---: | -----: | ---------------------: | -------: | -------------: | ---------------------: |
| Jev 1.13     | 55.0（48.7〜61.5） | 77.5 |   77.5 |     55.5（49.6〜62.0） |    100.0 |      190 / 275 |                 0.0352 |
| span-01 lite |  12.2（7.5〜17.2） | 56.1 |   56.1 |      13.8（9.7〜18.2） |    100.0 |      352 / 525 |                 0.0000 |

<!-- results:end -->

## 参考にした既存ベンチ

採点と見せ方は、次の decision model ベンチに合わせた。

| ベンチ                                                                               | 測るもの                                     | このベンチで取り入れた点                                                      |
| ------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------- |
| [Jev Decision Index](https://huggingface.co/spaces/multimodalart/jev-decision-index) | 37 ベンチを領域ごとに等重みで指数化          | 未対応・エラーを 0 点にする、全モデルで同じ問題文、NLI 系を macro-F1 で採点   |
| [S1MB](https://github.com/hotchpotch/S1MB)                                           | Noul・Choice・Score の 137 ベンチ（英語）    | chance 補正した skill、Noul を balanced accuracy で採点、失敗で分母を縮めない |
| [DecideBench](https://github.com/choyiny/decidebench)                                | 1 か所だけ違う 200 対の Choice（英語）       | 対の両方に正解した割合（対の正解率）、skill と速度の散布図                    |
| [JevBench](https://github.com/fstandhartinger/jevbench)                              | ルーティング・yes/no・分類など（英語）       | 1,000 判定あたりの費用、p50・p95 レイテンシ、確率を返すモデルの ECE と Brier  |
| [Arize の比較](https://arize.com/blog/decision-model-benchmark/)                     | ハルシネーション検出・LLM 評価・ルーティング | 二値を balanced accuracy で採点、較正誤差を別に示す                           |
| [AIMultiple AIM-Decision](https://aimultiple.com/system-one)                         | ブラウザ操作と分類                           | 費用と速度を指数に入れず別の軸で示す                                          |

どのベンチも、Noul しか受け付けないモデルに Choice をどう出すかは書いていない。
このベンチの選択肢ごとに Noul で聞く方法は独自のものなので、結果では「*」で区別する。

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
業務ルール判定は、25 のテーマごとに Opus 5.5 で架空の会社の規程を 8〜12 条で作り、その規程全体に対する事例の対を 5 組ずつ 2 回生成した。
対は DecideBench に倣い、ほぼ同じ 2 つの事例の 1 か所（金額、日付、役職、手続きの順序、例外の条件）だけを変えて答えを逆にしたもので、id の末尾の `a` が適合、`b` が不適合を意図している。
どの事例も 2 つ以上の条を組み合わせないと判断できないように指示し、問いは肯定形で条番号を書かせていない。
2 回目には 1 回目の問いを渡し、同じ論点を繰り返さないよう指示した。
判定するモデルには、規程全体と事例を `state` として毎回渡す。

## 正解ラベルの付け方

1 問ごとに `claude -p --model claude-opus-5-5 --effort high` を構造化出力（`--json-schema`）で 3 回独立に呼ぶ。
費用は `claude -p` が返す API 単価換算の値で、サブスクリプションで動かしたので実際の請求は発生していない。
3 回とも一致した問題を `split: test`、割れた問題を `split: hard` にし（業務ルール判定は、作るときに意図した答えと多数決が食い違う問題も `hard` にする）、最多の答えの割合を `agreement` に記録する。
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
