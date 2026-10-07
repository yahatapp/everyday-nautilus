# Everyday Nautilus

FTOのタイマー、Nautilusメソッドのステップ練習、手順暗記を支援するWeb／スマホ向けアプリ。

## 現在の状態

開発環境の準備段階です。Reactの起動ページ、cubing.jsによる実際のFTOスクランブル生成、共有データ型、Ao5計算を用意しています。タイマー・記録保存・ステップ別スクランブル・暗記機能は、次の開発フェーズで実装します。

- [開発計画](docs/DEVELOPMENT_PLAN.md)
- [確認した資料と採用方針](docs/REFERENCES.md)
- [CI/CDとCloudflare Workersの設定](docs/DEPLOYMENT.md)
- [Nix環境・Gitフックの使い方](docs/DEVELOPMENT_ENVIRONMENT.md)

## 開発を始める

Nixを導入し、`nix develop`でこのプロジェクト用のツールを利用します。pnpm 11.11.0・Git・Betterleaks・Lefthook等は`flake.lock`で固定し、CI/CDも同じ環境を使用します。Node.js 24.21.0は`package.json`の`devEngines.runtime`でpnpmが管理します。

```sh
nix develop
pnpm install --frozen-lockfile
lefthook install
pnpm exec node --version
pnpm dev
```

ブラウザで`http://localhost:5187`を開きます。環境変数や外部サービスのアカウントは不要です。

スマホ実機から確認する場合は、PCと同じネットワークで次を実行し、表示されたNetwork URLを開きます。

```sh
pnpm dev --host 0.0.0.0
```

将来のオフライン利用・インストール機能は、PWAを実装したうえでHTTPSまたはlocalhostで確認します。今回の起動ページにはService Workerをまだ追加していません。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | Web開発サーバー |
| `pnpm check` | 静的チェック・型チェック・ユニットテスト・本番ビルド |
| `pnpm format` | Biomeで整形と自動修正 |
| `pnpm test:watch` | ユニットテストの監視 |
| `pnpm test:repo` | 秘密情報・環境ファイル・ステージ済み差分の拒否動作を検証 |
| `pnpm audit:deps` | 開発・本番依存の既知の脆弱性を監査 |
| `pnpm verify:scrambler` | FTO生成結果をパズルモデルに適用し、逆手順による復元を検証 |
| `pnpm build` | 本番ビルド（`apps/web/dist`） |
| `pnpm preview` | 本番ビルドのローカル確認 |
| `pnpm test:e2e` | 本番ビルドでのデスクトップ／スマホ幅のブラウザ検証 |
| `pnpm test:e2e:workers` | Workersのローカル配信でFTO生成・SPA配信を検証 |
| `pnpm dev:workers` | ビルド済みアプリをローカルWorkersで配信 |
| `pnpm deploy:dry-run` | Workersの配信設定とアセットを公開せず検証 |
| `pnpm deploy:workers` | ビルド済みアセットを本番Workersへ公開 |

ブラウザ検証の初回準備：

```sh
pnpm exec playwright install --only-shell chromium
pnpm build
pnpm test:e2e
```

mainへのPRでCIを実行し、同じPRの古い実行はキャンセルします。mainへのマージ後はDeployがマージ結果を同じCIで検証し、成功した成果物をCloudflare Workersへ自動デプロイします。mainを指定した手動再デプロイも可能です。CIは静的チェック、Betterleaks、依存audit、テストを実行します。Dependabotは毎週月曜09:00（日本時間）にnpm依存とGitHub Actionsの更新PRを作成します。更新方針と`production`環境のSecrets設定は[デプロイ手順](docs/DEPLOYMENT.md)を参照してください。

2026-09-26の検証：Nix環境で静的チェック・型チェック・9件のユニットテスト・本番ビルド・FTO状態検証・Viteの2件／Workersの6件のE2E・Workers dry runが成功しました。pre-commit全4項目と検出動作の検証も成功し、依存audit・ソース／成果物のBetterleaksは検出なしです。実機・PWA・変更後のリモートCI/CDは今後確認します。

pre-commitでは、ローカル環境ファイルの拒否、ステージ済み差分のBetterleaksスキャン、`git diff --cached --check`、`pnpm check`を実行します。検索エンジン向けにはHTMLとHTTPヘッダーで`noindex`を設定しています。[環境とフックの詳細](docs/DEVELOPMENT_ENVIRONMENT.md)

本番ビルドには、生成器の一部の遅延チャンクが大きいという警告があります。MVPのPWA対応時に配信量とキャッシュ対象を調整します。

## 構成

```text
apps/web/             React + ViteのWebアプリ
packages/core/       UI・ブラウザに依存しない型／統計ロジック
packages/scrambler/  cubing.jsのBrowser／Node用アダプター
packages/scrambler/scripts/  スクランブルの動作確認
docs/                開発計画・調査記録
reference/           元資料のリンク
.github/             Dependabot、CI/CD、共通セットアップ
scripts/             コミット対象の検査と検出動作の検証
flake.nix / flake.lock  開発・CI/CD共通のNixツール環境
lefthook.yml         pre-commit設定
wrangler.jsonc       Cloudflare WorkersのStatic Assets配信設定
```

共有パッケージは非公開で、TypeScriptソースを各アプリのビルド時に取り込みます。将来の`apps/mobile`はExpoを候補にしています。cubing.jsのWorkerはReact Nativeで動作検証が必要なため、共有コアから分離しています。

## スクランブルと資料

通常練習には`randomScrambleForEvent("fto")`を利用します。公式大会用のスクランブル生成ソフトとしての認定を意味するものではありません。生成元とバージョンを記録し、正式なTNoodleのFTO対応が公開された時に比較できるようにしています。[cubing.js仕様](https://js.cubing.net/cubing/scramble/)

手順表は内容・構造を確認済みですが、アプリ用のケースデータにはまだ変換していません。出典・図・記法の検証と利用条件の確認を行ってから導入します。

## Nodeのバージョン管理

プロジェクトで使用するNodeを更新する場合は、次のコマンドで`package.json`とlockfileを更新して検証します。

```sh
pnpm runtime set node <バージョン>
pnpm exec node --version
pnpm check
```

バージョンと配布ファイルのチェックサムを`pnpm-lock.yaml`に記録します。CIもNixから導入したpnpmで同じ指定を読み取ります。Nix側のNodeはpnpm起動用なので、このプロジェクトのスクリプトは`pnpm`経由で実行してください。[pnpmのランタイム管理](https://pnpm.io/package_json#devenginesruntime)
