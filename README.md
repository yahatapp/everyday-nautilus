# Everyday Nautilus

FTOのタイマー、Nautilusメソッドのステップ練習、手順暗記を支援するWeb／スマホ向けアプリ。

## 現在の状態

開発環境の準備段階です。Reactの起動ページ、cubing.jsによる実際のFTOスクランブル生成、共有データ型、Ao5計算を用意しています。タイマー・記録保存・ステップ別スクランブル・暗記機能は、次の開発フェーズで実装します。

- [開発計画](docs/DEVELOPMENT_PLAN.md)
- [確認した資料と採用方針](docs/REFERENCES.md)
- [CI/CDとCloudflare Workersの設定](docs/DEPLOYMENT.md)

## 開発を始める

pnpm 11.11.0を使用します。Node.js 24.21.0は`package.json`の`devEngines.runtime`に固定し、pnpmが導入・管理します。`pnpm install`でプロジェクト用のNodeを導入し、`pnpm`経由のコマンドはそのNodeを使用します。

```sh
pnpm install --frozen-lockfile
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

GitHub Actionsでは静的チェック、Git履歴と本番アセットのシークレットスキャン、テストを実行します。すべて成功した`main`のビルド成果物をCloudflare Workersへ自動デプロイします。GitHub接続と`production`環境のSecrets設定は[デプロイ手順](docs/DEPLOYMENT.md)を参照してください。

2026-09-26の検証：静的チェック・型チェック・9件のユニットテスト・本番ビルド・NodeのFTO検証・PC／スマホ幅の2件のE2E・開発モードのFTO生成が成功しました。実機・PWA・リモートCIは今後確認します。

CI/CD追加時には、actionlint、ソースと本番アセットのGitleaksスキャン、Wrangler dry run、Workers配信での4件のE2Eも成功しました。削除済みのダミーの秘密情報をGit履歴から検出し、失敗終了とログのマスクも確認しています。本番公開はGitHub接続とSecrets登録後に確認します。

本番ビルドには、生成器の一部の遅延チャンクが大きいという警告があります。MVPのPWA対応時に配信量とキャッシュ対象を調整します。

## 構成

```text
apps/web/             React + ViteのWebアプリ
packages/core/       UI・ブラウザに依存しない型／統計ロジック
packages/scrambler/  cubing.jsのBrowser／Node用アダプター
packages/scrambler/scripts/  スクランブルの動作確認
docs/                開発計画・調査記録
reference/           元資料のリンク
.github/             CI/CD、共通セットアップ、検証ツール
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

バージョンと配布ファイルのチェックサムを`pnpm-lock.yaml`に記録します。CIも`pnpm/setup`で同じ指定を読み取り、pnpmでNodeを導入します。シェルからの直接の`node`実行はグローバル環境のNodeを使用するため、このプロジェクトのスクリプトは`pnpm`経由で実行してください。[pnpmのランタイム管理](https://pnpm.io/package_json#devenginesruntime)
