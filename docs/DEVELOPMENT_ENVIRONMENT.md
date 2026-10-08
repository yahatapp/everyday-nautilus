# Nix環境とGitフック

## 初回セットアップ

Nixとflakesを有効にする。対象はApple Silicon macOS、Linux x64／ARM64。WindowsはWSL2でLinux環境を利用する。Nix自体の導入は[Nix公式](https://nixos.org/download/)を参照。

```sh
nix develop
pnpm install --frozen-lockfile
lefthook install
pnpm check
```

`nix develop`のシェル内でGitやpnpmを使用する。シェルを開かず単発で実行する場合は`nix develop --command pnpm check`とする。flakeファイルはGit管理に含める。`path:.`による起動はローカルキャッシュや環境ファイルまでNixストアに取り込むため使用しない。

CI/CDも同じ`flake.nix`・`flake.lock`を使う。GitHub Actionsのcheckout用GitとNixインストーラーは環境を用意する段階で使い、その後のプロジェクトコマンドはNixで実行する。

## バージョンの管理

| 対象 | 固定元 |
| --- | --- |
| pnpm 11.11.0 | `package.json`の`packageManager`をNixが読み取る。配布アーカイブのハッシュは`flake.nix` |
| Git 2.55.0、Betterleaks 1.8.1、Lefthook 2.1.14、actionlint 1.7.12、ShellCheck、nixfmt | `flake.lock`に固定したNixpkgs |
| アプリのNode 24.21.0 | `package.json`の`devEngines.runtime`と`pnpm-lock.yaml`。pnpmが導入 |
| pnpm起動用Node | 固定したNixpkgsのNode 24。アプリの実行には`pnpm exec node`を使う |
| アプリの依存・Wrangler | 各manifestと`pnpm-lock.yaml` |

```sh
nix eval --json .#toolVersions
pnpm exec node --version
```

Nixpkgs更新時は`flake.nix`のリビジョンを更新し、`nix flake lock`を実行する。pnpm更新時は`packageManager`・`engines`とNix側の配布ハッシュも更新する。Nodeは`pnpm runtime set node <version>`で更新する。変更後はNix環境でCI相当の検証を実行し、lockfileをコミットする。

## pre-commit

LefthookはNixで導入し、`lefthook install`でこのcheckoutにフックを登録する。新しいclone／worktreeでは再度登録する。npmのpostinstallによる登録は行わない。

| 検査 | 対象と挙動 |
| --- | --- |
| reject local environment files | ステージ済みの追加・更新・rename先を検査。`git add --force`でも拒否 |
| Betterleaks | ステージ済みの差分をスキャン。未ステージの編集で秘密情報を消しても検出 |
| `git diff --cached --check` | ステージ済み差分の空白エラー・競合マーカーを検出 |
| `pnpm check` | 作業ツリー全体のBiome・型・ユニットテスト・本番ビルド |

各コマンドは`nix develop --command`で実行する。`pnpm check`は一部だけステージした場合も作業ツリー全体を検証するので、PRのCIでコミット済みの内容も必ず検証する。

拒否するもの：`.env*`、`.dev.vars*`、`.envrc.local`、`.npmrc`、`.pnpmrc`、`.netrc`、`.pypirc`、`lefthook-local.*`、`.direnv`・`.wrangler`・依存キャッシュ配下。`.env.example`と`.dev.vars.example`はテンプレートとして許可するが、秘密情報を含めない。削除は許可する。CIでは既に追跡されているファイルも検査する。

```sh
lefthook run pre-commit --force
pnpm test:repo
```

`test:repo`は一時Gitリポジトリで、強制追加・空白や改行を含むパス・既存追跡ファイル・テンプレート・削除、ステージ済みと履歴内のダミートークン、ログのマスク、空白エラーを検証する。ダミーは毎回生成し、終了時に一時リポジトリを削除する。

## 秘密情報と依存の監査

```sh
betterleaks git . --log-opts="--all" --config=.betterleaks.toml --redact=100 --no-banner --no-color --ignore-gitleaks-allow
betterleaks dir . --config=.betterleaks.toml --redact=100 --no-banner --no-color --ignore-gitleaks-allow
pnpm audit:deps
```

Betterleaksは固定版の標準ルールを継承し、ローカルキャッシュを除外する。`.env`やソース、本番成果物はスキャン対象。ログは100%マスクし、インラインのallowコメントは無視する（CLIのフラグ名は`--ignore-gitleaks-allow`）。検出した値の有効性を外部APIへ問い合わせるvalidationは使用しない。[Betterleaksのスキャン仕様](https://github.com/betterleaks/betterleaks/blob/v1.8.1/docs/scanning.md)

`pnpm audit:deps`は本番・開発・optional依存を監査し、low以上の既知の脆弱性があれば失敗する。レジストリの通信エラーも失敗として扱い、例外指定やエラー無視は初期設定に含めない。[pnpm audit](https://pnpm.io/cli/audit)
