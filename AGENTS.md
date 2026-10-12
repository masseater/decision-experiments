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

## 環境変数と認証

- 環境変数は必要最小限にする。環境変数が一つ増えるだけで、どの環境で何を設定するかという考慮事項が爆発的に増えるためである。
- 環境変数にしてよいのは、設定や認証に限らず、本当に環境ごとに変わる値だけである。環境で変わらない値はコードや Alchemy の設定に書き、ツールにフラグがあればフラグを使う。
- Cloudflare などのクラウドの認証は Alchemy のプロファイルで管理する。

## Cloudflare

- Cloudflare は Workers Paid プランを契約している前提でよい。Paid プランでしか使えない機能や上限を前提に設計してよい。
- GitHub Secret の `CLOUDFLARE_API_TOKEN` には、Workers の編集に加えて masseater.dev ゾーンの Workers Routes Edit が要る。`alchemy.run.ts` が `masseater.dev/injection-bisect*` のルートを作るためで、無いとデプロイが Forbidden で落ちる。
- `.php` や `.env` を総当たりする脆弱性スキャンは、ゾーンの WAF カスタムルールで block する。`/.env` と `/wp-login.php` だけはハニーポットの Worker が受け、404 を返して Analytics Engine に 1 件ずつ記録する。どちらも `apps/web/edge-guard.ts` にある。block した分は Security Events に残り、Worker に届かないので普段の Workers Logs やトレースには混ざらない。
- ゾーンの WAF カスタムルールは、1 つのゾーンにつき 1 つのスタックだけが持つ。ゾーンを持つリポだけが `apps/web/alchemy.run.ts` の `OWNED_ZONE` にゾーン名を入れる。サブドメインで動くリポは入れず、ゾーンを持つリポのルールで守られる。今の持ち主は masseater.dev ゾーンの masseater/masseater.dev である。
- Bot Fight Mode は、GitHub Actions からの送信や MCP クライアントのような正当な自動アクセスまで止めるので使わない。

## ライブラリの型

- ライブラリが型を提供する値は、`Schema.decodeUnknown*` で受けて型を捨てない。ライブラリの型のまま受けて `Schema.decode*` に渡す。入力の型が Schema の Encoded と食い違えばコンパイルが落ちる。
- ライブラリが export する型・スキーマ・enum・定数を自前で書き写さない。一部だけ使うときも `Pick` などでライブラリの型から作る。
- 入力が `unknown` でなければ、`@effect/tsgo` の `prefer-typed-schema-decoder`（error）が `decode*` を求める。

## 外部 API クライアント

Effect から外部 API や SaaS を呼ぶクライアントは手で包まず、次の順で選ぶ。

1. Effect 公式のパッケージ（https://github.com/Effect-TS/effect#packages）にあれば使う。
2. distilled.cloud に Effect 定義があれば使う。Cloudflare は生成済みの `@distilled.cloud/cloudflare` を使う。
3. どちらにもなければ、公開されている OpenAPI から `@effect/openapi-generator` の `openapigen` で生成する。

## レビューとCI

- PRのレビューは行わない。PRは作ったらすぐマージする。
- PRのタイトルと本文は基本的に人間が読まないので、人間向けの説明を書かない。後でエージェント自身が検索したときに、自然に思いつく単語で引っかかり、何をしたか分かる程度でよい。
- PR単位のCIは走らせない。`pull_request` トリガーのワークフローは、最新の main を取り込んでいない PR のマージをルールセットで拒むための `up-to-date`（何も検査しない）だけにする。
- CIはmainへのpushで必ず走らせる。ワークフローは `.github/workflows/verify.yml` である。
- デプロイやリリースのジョブは、同じワークフローで `needs: verify` を指定し、mainの必須CIが通ってから実行する。
- マージ前に必ず base ブランチを取り込み、手元の `vp run verify` を通してからマージする。コンフリクトしないからといって、取り込まないままマージしない。マージしてよいかは聞かない。
- PRごとの動作検証やデプロイはしない。動作の確認は、mainにマージしてデプロイされた本番で実測して行う。
- Claude のクラウドセッションではプロキシが GitHub API を拒むため、`actions-lint` タスク（`vite.config.ts`）は `CLAUDE_CODE_REMOTE` が設定されていると zizmor に `--no-online-audits` を付け、オフライン監査だけを行う。フックにも渡る環境変数で切り替えるため、Stop フックの verify でも同じになる。オンライン監査は main の CI（`.github/workflows/verify.yml`）が担う。

## oxlint-plugin-decision

- 文章で書く lint ルールは `decision-rules.ts` に `defineDecisionRule` で書き、`vite.config.ts` で有効にする。`vp check` が判定し、答えは `node_modules/.cache/oxlint-plugin-decision` にキャッシュされる。
- 無料の `openrouter/respan/span-01-lite` で判定できないルールだけを有料の decider で判定する。判定できるかは、正解の分かる違反例と、このリポジトリの書き方どおりに書いた違反でない例を、キャッシュを消して `OXLINT_DECISION_EXPLAIN=json` で判定させて確かめる。無料で判定できるルールにまで課金しないためである。
- OpenRouter の使用量は、リポジトリと実行元（`github-actions`・`claude-code-cloud`・`claude-code`・`local`）ごとのアプリに分かれる。実行元は `GITHUB_ACTIONS`・`CLAUDE_CODE_REMOTE`・`CLAUDECODE` で見分けるため、`verify` タスクはこれらを `untrackedEnv` で lint に渡す。

## 計測

- 推測するな、計測しろ。仮説を立てたら、実装や修正の前に計測で事実を確かめ、その結果だけで判断する。
- 機能開発に取り掛かる前に、AIが自分でデバッグできる仕組みを必ず作る。再現手段、ログやスパン、その出力を読む経路の3つである。
- 時間かお金を使う処理（外部APIやモデルへのリクエスト、子プロセス、ファイルの入出力など）は、Workersに限らずすべてスパンにし、外から読めるようにする。Workers以外のプロセス（CLI、ライブラリ、ワーカースレッド）は、Effect公式の `OtlpTracer.layerFromConfig` を使い、標準の `OTEL_TRACES_EXPORTER=otlp` と `OTEL_EXPORTER_OTLP_ENDPOINT` が設定されたときだけOTLPに出す。Effect は `OTEL_TRACES_EXPORTER` が無いと送らない。
- スパンは時間を使っている処理そのものに仕込む。計測のためだけにコマンドやプロセスを包まない。
- GitHub Actions も計測対象である。各ワークフローの最後に `.github/scripts/ci-telemetry.sh` を動かすジョブを置き、ジョブとステップの所要時間を `apps/web/ci-telemetry.worker.ts` の Worker に送る。Worker は GitHub の OIDC トークンで送り元のリポジトリを確かめ、1 件ずつ構造化ログとして Workers Logs に残す。受け口は Alchemy で定義し、Cloudflare の外にサービスやシークレットを増やさない。
- 計測は本番環境で行えるようにする。できないときは、あらゆる手段で本番同等を保証したステージング環境を作って行う。手元やテスト環境だけの計測は判断の根拠にしない。
- 実践の手順は `measure-dont-guess` スキルにある。不具合の調査は `systematic-debugging`、完了の確認は `verification-before-completion` スキルに従う。

## 脆弱性スキャン

- OWASP ZAP のベースラインスキャンを `.github/workflows/zap.yml` に置く。verify とは別のワークフローで、毎週と手動で動く。
- 既定では動かない。リポジトリの Variables に `ZAP_TARGET_URL`（本番の URL）を設定すると有効になる。
- 警告を含め、ZAP のアラートが 1 件でもあればジョブを失敗にし、すぐ直す。レポートはワークフローの成果物 `zap_scan` に残る。誤検知だけを `.github/zap/rules.tsv` に `ルールID<TAB>IGNORE<TAB>(ルール名)` で書く。
- 依存パッケージの既知の脆弱性は、verify の `audit` タスク（`vp pm audit`）が落とす。直すときは `vp pm audit --fix` で `pnpm-workspace.yaml` の overrides に修正版を足す。修正版が出ていない勧告だけを、`auditConfig.ignoreGhsas` に GHSA の ID で載せ、理由をコミットメッセージに書く。

## スキル

- 複数のリポジトリで共通に使う自作のスキルは https://github.com/masseater/skills に置き、skills CLI で `skills-lock.json` に追加する。リポジトリにコピーしない。

## ベース

- このリポジトリのベースは https://github.com/masseater/typescript-template である。テンプレート由来の構成・方針はテンプレートに従う。

## injection-bisect

- このリポジトリは、フロンティアモデルに渡す前の入力にプロンプトインジェクションが含まれるか、含まれるならどこかを、decision モデルで速く安く判定する。ライブラリは `libs/injection-bisect`、CLI は `tools/cli` にある。
- 判定は入力全体への 1 回の問い合わせから始める。確率がしきい値未満なら、それ以上問い合わせない。
- しきい値を超えたら、文単位で文の数の平方根（切り上げ、最低 2）個に分けて（`branchesFor`）別々のリクエストで並列に問い、超えた区間だけを再帰する。どの区間も超えなければ、文をまたぐか文脈が要るものとして親の区間を返す。2026-10-12 の計測では、8〜12 文の例文 6 件×3 回で 2 分割 1,402ms・8.3 回、4 分割 884ms・7.8 回、8 分割 929ms・10.3 回、53 文のニュース記事×3 回で 2 分割 1,708ms・13 回、4 分割 1,073ms・12 回、8 分割 808ms・15 回、16 分割 1,203ms・20 回だった。短い文章は 4、長い文章は 8 が速く、どちらも平方根に近い。
- 1 リクエストに区間ごとの質問を並べる方式は使わない。注入より後ろの無害な行まで陽性になり、位置を絞れないことを計測で確かめたためである。
- 既定のモデルは無料の `respan/span-01-lite` である。2026-10-12 の計測では、日本語の間接インジェクションは span-01-lite で取れたが、英語や独語の直接的な乗っ取りは `perplexity/pplx-decider-v1.1-27b` のほうがよく取れた。モデルの既定を変えるときは、計測し直してユーザーに確認する。
- 判定モデルは `InjectionJudge` サービスの裏に置く。OpenRouter は Effect 公式の `@effect/ai-openrouter` の `OpenRouterClient.createDecisions` で呼び、`HTTP-Referer`・`X-Title`・`X-OpenRouter-App-Visibility: hidden` を付ける。
- 問い合わせは 1 回ずつ `injection-bisect.ask` スパン（区間の開始位置と文字数）と、その子の `injection-bisect.openrouter` スパン（モデル・入力トークン・費用・確率）にする。所要時間はスパンの長さで読む。
- 精度・費用・時間の比較は、無害な入力と注入を含む入力の両方を含むデータで、フロンティアモデルに直接判定させた場合と並べて計測する。OpenRouter のキーには月の上限があるので、計測の前後に `GET https://openrouter.ai/api/v1/key` で残りを確かめる。
- 公開する Web のデモ（https://masseater.dev/injection-bisect 、Vite の base と masseater.dev ゾーンの Workers ルートで載せる）は、見る人が入力したキーでブラウザから OpenRouter を直接呼び、二分探索もブラウザで動かす（`openRouterPerRequest` と `withApiKey`）。サーバーはキーを持たず、受け取りもしない。第三者にリポジトリ所有者のキーを使わせないためである。問い合わせの経過は `ProbeListener` で流して画面に出す。
