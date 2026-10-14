# injection-bisect

## 公開先

- Web のデモ: https://masseater.dev/injection-bisect/

## 読める形式

| 形式                       | 名前                                                               | 判定するところ                                                                                                     |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| テキスト                   | `plain`（.txt・.log・.tex・.rst・.adoc など）                      | 全文                                                                                                               |
| HTML                       | `html`（Vue・Svelte・Astro のファイルも）                          | 本文、コメント、属性の値、`script`（JSON-LD を含む）と `style` の各行                                              |
| Markdown                   | `markdown`                                                         | 見出し、段落、表のセル、画像（alt と title）、リンクの title、コードブロック（言語ごとに読む）、HTML、front matter |
| JSON                       | `json`                                                             | 文字列の値とコメント（JSON with Comments）。Slack・Discord・GitHub の書き出しもこれで読む                          |
| YAML                       | `yaml`                                                             | 文字列の値とコメント                                                                                               |
| XML・RSS・Atom             | `xml`                                                              | テキスト、コメント、属性の値、CDATA（中身の形式で読む）                                                            |
| CSV・TSV                   | `csv`・`tsv`                                                       | 各セル                                                                                                             |
| 字幕                       | `srt`・`vtt`                                                       | 字幕の文と NOTE                                                                                                    |
| ソースコード・設定ファイル | `typescript`・`python`・`go`・`toml`・`ini`・`docker` など 64 種類 | コメント、文字列リテラル、設定の値                                                                                 |
| メール                     | `email`                                                            | 差出人・宛先・件名と、テキストと HTML の本文                                                                       |
| PDF                        | `pdf`                                                              | 各ページのテキスト。テキストの無いページは画像を OCR で読む                                                        |
| 画像                       | `image`（PNG・JPEG・WebP・GIF・BMP・TIFF）                         | OCR で読んだ文字（日本語と英語）                                                                                   |
| Word・PowerPoint・Excel    | `docx`・`pptx`・`xlsx`                                             | 本文、コメント、ノート、画像の説明、セルの文字列                                                                   |

CLI は `--format` で形式を指定する。指定しなければ、ファイルの拡張子と中身から選ぶ。
Web のデモでは形式を選ぶか、ファイルを開く。

## セットアップ

```sh
vp install
cp .env.example .env
vp exec --filter web alchemy profile edit --add Cloudflare
vp run verify
```

Cloudflare の認証情報は環境変数ではなく Alchemy のプロファイル（`~/.alchemy`）で管理する。
デプロイと `.mcp.json` の Cloudflare MCP は、どちらもこのプロファイルの認証情報を使う。

## 環境変数

ルートの `.env` に書く。

| 名前                 | 用途                                            |
| -------------------- | ----------------------------------------------- |
| `OPENROUTER_API_KEY` | `vp check` で走る oxlint-plugin-decision の判定 |

## GitHub の設定

Actions の secrets、Actions による PR 作成の許可、PR を作れる人の制限、既定ブランチのルールセットを gh で設定する。
手順は `setup-template` スキル（[masseater/skills](https://github.com/masseater/skills)）にある。

## 起動とデプロイ

```sh
cd apps/web
vp run dev
vp run deploy
```
