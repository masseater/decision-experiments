<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## コマンド

- `vp run verify` は、ルートの `vp check` にテスト・ESLint・syncpack・textlint と yomiyasu・renovate・actionlint と zizmor・steiger・fallow・gitleaks・audit を足した検査である。
- `vp check` の decision lint は `apps/*/src` だけに掛かり、`.env` の `OPENROUTER_API_KEY` で判定する。
- 1 つのテストファイルは、パッケージのディレクトリで `vp test run src/<name>.test.ts` として動かす。ルートの `vp run --filter <package> test -- <file>` ではファイルが絞られない。
- アプリの起動とデプロイは `apps/<name>` で `vp run dev`・`vp run deploy` を使う。
- Cloudflare の認証情報は環境変数ではなく Alchemy のプロファイルに置く。`vp exec --filter web alchemy profile edit --add Cloudflare` で入れる。

## 構成

- `libs/injection-bisect` は文書を `Parser` で区間に分け、区間の並びを √n 個の枝に割り、確率が `cutoff` 以上の枝だけを再帰的に細かく問い直す。`apps/web` のデモと `tools/cli` が使う。
- ワークスペース内のパッケージは `src/index.ts` を直接読む。npm に出すのは `libs/injection-bisect` の `dist` だけで、`publish.yml` を手動で動かして出す。
- `libs/ocr-decide` は請求書の画像を OCR で断片にし、decision モデルで項目に割り当てる。`apps/ocr-decide` はこれをブラウザーで動かし、計測結果も表示する。
- 計測は `tools/ocr-measure` で行う。`render` が `data/` の請求書を画像にし、`measure` が `results/details.json` と `libs/ocr-measurements/summary.json` を書き、`rescore` はモデルに問い合わせず details.json から summary.json を書き直す。
- 2 つのアプリは `infra/start-site` の Vite と Alchemy の設定、`libs/web-ui` の部品を共有し、masseater.dev の `/<APP_NAME>/` で公開される。
- `libs/web-ui` は背景やテーマを masseater/masseater.dev の `libs/ui`（`@masseater.dev/ui`）から git の subpath 依存で読む。lockfile が main のコミットを固定するので、新しい版は `vp update @masseater.dev/ui` で取り込む。色のトークンは @shadcn/lint が読めるよう `libs/web-ui/src/styles.css` に置く。

## 環境変数

- 環境変数は環境ごとに変わる値だけにする。変わらない値はコードか Alchemy の設定に、ツールにフラグがあればフラグにする。

## Cloudflare

- Workers Paid プランを前提にする。
- ゾーンの WAF カスタムルールと Logpush のジョブは、masseater.dev ゾーンの持ち主の masseater/masseater.dev だけが持つ。ほかのリポは `OWNED_ZONE` を入れない。
- GitHub Secret の `CLOUDFLARE_API_TOKEN` には、Workers の編集に加えて masseater.dev ゾーンの Workers Routes Edit を付ける。
- Worker にはすべて `logpush: true` を付ける。
- Bot Fight Mode は使わない。

## ライブラリ

- ライブラリが型を提供する値は、その型のまま `Schema.decode*` に渡す。
- ライブラリが export する型・スキーマ・enum・定数を書き写さない。
- 外部 API のクライアントは手で包まず、Effect 公式のパッケージ、distilled.cloud（Cloudflare は `@distilled.cloud/cloudflare`）、公開 OpenAPI から `@effect/openapi-generator` で生成、の順に選ぶ。

## PR とマージ

- PR のレビュー、PR ごとの CI・動作検証・デプロイはしない。動作は本番で確かめる。
- マージ前に base を取り込み、手元の `vp run verify` を通してから自分でマージする。マージしてよいかは聞かない。ルールセットのバイパスや `--admin` は使わない。

## oxlint-plugin-decision

- 有料の decider は、無料の `openrouter/respan/span-01-lite` で判定できないルールだけに使う。判定できるかは、正解の分かる違反例と違反でない例を、キャッシュを消して `OXLINT_DECISION_EXPLAIN=json` で確かめる。
- ルールが使うモデルは、ユーザーの指示なしに変えない。

## 計測

- 推測せず計測する。実装や修正の前に本番で事実を確かめ、その結果だけで判断する。
- 機能開発の前に、AI が自分でデバッグできる仕組み（再現手段、ログやスパン、それを読む経路）を作る。
- 時間かお金を使う処理はすべてスパンにする。Workers 以外は `OtlpTracer.layerFromConfig` で出す。計測のためだけにコマンドやプロセスを包まない。
- ワークフローの最後には `.github/scripts/ci-telemetry.sh` を動かすジョブを置く。

## 脆弱性

- ZAP のアラートは警告も含めすぐ直す。誤検知だけを `.github/zap/rules.tsv` に書く。
- `audit` は `vp pm audit --fix` で直す。修正版の無い勧告だけを `auditConfig.ignoreGhsas` に載せ、理由をコミットメッセージに書く。

## 公開先

- デプロイ先や外部公開しているもの（サイト、API、npm パッケージなど）があれば、その URL を README に一覧で載せる。

## スキル

- 複数リポで使う自作スキルは masseater/skills に置き、skills CLI で入れる。

## injection-bisect

- ライブラリの版は手で上げない。
- 入力の形式ごとの処理は `segment.ts` に足さず、`Parser` として並びに加える。形式の読み取りは自前で書かず、officeparser・SheetJS・papaparse・ical.js・srt-vtt-parser・ass-compiler・nbformat・linguist-languages と refractor・file-type などのライブラリを使う。
- `respan/` のモデルには、1 リクエストに区間ごとの質問を並べない。choice の質問も使わない。
- 既定のモデル `respan/span-01-lite` を変えるときは、計測し直してユーザーに確認する。
- 精度・費用・時間の比較は、無害な入力と注入を含む入力の両方で、フロンティアモデルに直接判定させた場合と並べる。計測の前後に `GET https://openrouter.ai/api/v1/key` でキーの残りを確かめる。
- Web のデモはサーバーの処理を持たない。OpenRouter のキーは見る人が入力し、サーバーは持たず受け取りもしない。
