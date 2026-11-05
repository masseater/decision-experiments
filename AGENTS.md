作業を始める前に `repo-conventions` と `vite-plus` の skill を読み、従う。どちらも masseater/skills にあり、`vp install` が `.agents/skills/` に入れる。

## コマンド

- `vp run verify` は、ルートの `vp check` にテスト・syncpack・textlint と yomiyasu・renovate・actionlint と zizmor・steiger・fallow・gitleaks・audit を足した検査である。
- `vp check` の decision lint は `apps/*/src` だけに掛かり、`.env` の `OPENROUTER_API_KEY` で判定する。
- 1 つのテストファイルは、パッケージのディレクトリで `vp test run src/<name>.test.ts` として動かす。ルートの `vp run --filter <package> test -- <file>` ではファイルが絞られない。
- アプリの起動とデプロイは `apps/<name>` で `vp run dev`・`vp run deploy` を使う。
- Cloudflare の認証情報は環境変数ではなく Alchemy のプロファイルに置く。`vp exec --filter web alchemy profile edit --add Cloudflare` で入れる。

## 構成

- `libs/injection-bisect` は文書を `Parser` で区間に分け、区間の並びを √n 個の枝に割り、確率が `cutoff` 以上の枝だけを再帰的に細かく問い直す。`apps/web` のデモと `tools/cli` が使う。
- ワークスペース内のパッケージは `src/index.ts` を直接読む。npm に出すのは `libs/injection-bisect` の `dist` だけで、`publish.yml` を手動で動かして出す。
- `libs/ocr-decide` は請求書の画像を OCR で断片にし、decision モデルで項目に割り当てる。`apps/ocr-decide` はこれをブラウザーで動かし、計測結果も表示する。
- 計測は `tools/ocr-measure` で行う。`render` が `data/` の請求書を画像にし、`measure` が `results/details.json` と `libs/ocr-measurements/summary.json` を書き、`rescore` はモデルに問い合わせず details.json から summary.json を書き直す。
- OCR エンジンの日本語の読み取りは `tools/ocr-ja-bench` で測る。`render` が合成ページを、`prepare-data` が JaWildText の写真を `.cache/` に用意し、`measure [エンジン ID...]` が `results/` と `libs/ocr-measurements/ja-bench.json` を書く。ローカルのエンジンは `engines/<名前>/run.py` を uv で動かし、Surya は llama.cpp の要る Mac で測る。
- `tools/bench` は日本語 decision model のベンチで、`vp run bench` で動かす（`tools/bench/vite.config.ts` のタスク）。`data/` の JSONL を読み、OpenRouter の応答を `cache/` に、モデルごとの結果を `results/` に保存してコミットするので、再実行は成功済みの判定を呼び直さない。終わると `docs/decision-bench.md` の `results:start`〜`results:end` の表と `libs/bench-summary/summary.json` を書き換え、`apps/decision-bench` がその JSON からリーダーボードを `/decision-bench` に出す。
- `apps/web` と `apps/ocr-decide` は `infra/start-site` の Vite と Alchemy の設定、`libs/web-ui` の部品を共有し、masseater.dev の `/<APP_NAME>/` で公開される。各アプリの `app-name.ts` の `APP_NAME` を変えるとリソースは作り直される。
- `libs/web-ui` は背景やテーマを masseater/masseater.dev の `libs/ui`（`@masseater.dev/ui`）から git の subpath 依存で読む。lockfile が main のコミットを固定するので、新しい版は `vp update @masseater.dev/ui` で取り込む。色のトークンは @shadcn/lint が読めるよう `libs/web-ui/src/styles.css` に置く。

## Cloudflare

- GitHub Secret の `CLOUDFLARE_API_TOKEN` には、Workers の編集に加えて masseater.dev ゾーンの Workers Routes Edit を付ける。

## injection-bisect

- ライブラリの版は手で上げない。
- 入力の形式ごとの処理は `segment.ts` に足さず、`Parser` として並びに加える。形式の読み取りは自前で書かず、officeparser・SheetJS・papaparse・ical.js・srt-vtt-parser・ass-compiler・nbformat・linguist-languages と refractor・file-type などのライブラリを使う。
- `respan/` のモデルには、1 リクエストに区間ごとの質問を並べない。choice の質問も使わない。
- 既定のモデル `respan/span-01-lite` を変えるときは、計測し直してユーザーに確認する。
- 精度・費用・時間の比較は、無害な入力と注入を含む入力の両方で、フロンティアモデルに直接判定させた場合と並べる。計測の前後に `GET https://openrouter.ai/api/v1/key` でキーの残りを確かめる。
- Web のデモはサーバーの処理を持たない。OpenRouter のキーは見る人が入力し、サーバーは持たず受け取りもしない。
