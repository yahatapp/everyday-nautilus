# 資料確認と技術調査

確認日：2026-09-26。外部の仕様・リリース状況は、公開前と依存更新時に再確認する。

## 手順表

| 資料 | 確認した構造 | 開発での用途 |
| --- | --- | --- |
| [FTO Nautilus｜入門・2-look LL](https://docs.google.com/spreadsheets/d/1uWlv74fDLJM97JQ56VrSpom-CaWv36Re0HT3kG8Jydo/edit?gid=868663889#gid=868663889) | `Nautilus 入門・2-look LL`。FB → Centers → Last Triple → LL、少数手順からL6X 35／L3C 5への段階づけ | 初中級者向けの導線、練習ステップ、記法の確認 |
| [FTO Nautilus｜Full 1LLL 377ケース](https://docs.google.com/spreadsheets/d/1tjEwwDzFP1aoLKH5eCuQAzcHH9v5Xrvn0H0Kmfvme0M/edit?gid=308154264#gid=308154264) | ユーザー指定。`Full 1LLL｜377`、8行目にヘッダー、9–385行目にケース。系・群・ケース名・日本語模様・推奨手順・STM・Cost・図リンク・別候補・習得・実行メモ | 日本語1LLLカタログの優先資料。原表と状態・記法を照合 |
| [Nautilus FTO Last Layer Algorithms](https://docs.google.com/spreadsheets/d/1Dh4MEQzpCuTylqnkn09UxBEvEq9MNYMqMiWQgFsBuYE/edit) | Notation、L6X、L3C、PL6X、認識ガイド、Credit。L6X 35／L3C 5は解法サイトの説明とも一致 | 基本ケース、代替手順、認識図の照合 |
| [FTO Nautilus LL](https://docs.google.com/spreadsheets/d/15v0A0PipO8RcEeS7TFAaAv3dI1zBykaopkXQK_WnLo0/edit) | Intro、Index、T0–T5／H1–H10／D1–D16／C1–C4、FTO LL Alg Dump。Dumpの先頭と末尾を読み、ID 1–377を確認 | 1LLLケースのグループ分け、推奨手順候補、セットアップ |
| [Nautilus解法ガイド](https://nautilusfto.com/)・[Last Layer](https://nautilusfto.com/Step4/) | 4ステップ、初心者向けから1LLLまでの説明 | ステップの完成条件と資料間の記法を確認 |

元のリンクファイルでは入門と1LLLが同じURLだった。ユーザーから別の日本語1LLLシートの指定を受け、そのリンクへ修正した。入門シートF89・F91から発見した原表も照合用に残している。指定シートB7・H9のリンクでも原表との関係を確認できた。

今回の確認は構造と抜粋の調査であり、377ケースすべての手順・画像・重複・到達状態の正しさを検証したものではない。公開用カタログ作成時に全件検証する。

### 取り込み時の注意

- `{U,R}`等は持ち替え指示。手順中の回転とは別に保存する。
- `(U)`等のAUFを、かっこの付いたトリガーまとまりと区別する。
- CIF／EIFの面名対応、ワイドターン、小文字、`2'`、曲がった引用符を正規化する。
- 1LLLのIntroには独自のパズル定義・同値関係がある。cubing.jsの標準FTO定義と同一であると仮定しない。
- Dumpの手順には複数候補や`[stm: … cost: …]`等の注記がある。実行手順・評価・注記を分離する。
- 指定の日本語シートのCostは原表の評価値であり、実測タイムではない。習得・実行メモの個人データは公開カタログから分離し、必要な場合に個人用として取り込む。
- 空の画像セルも、数式・埋め込み画像・リンクを確認するまで「図なし」と判断しない。
- 安定した独自case ID、出典URL、元タブ・範囲、取得日、カタログ版を保存する。
- 元資料は読み取り専用。公開時の転載条件・帰属を確認し、必要な図は検証済み状態から自作する。

## スクランブル

| 候補 | 確認結果 | 判断 |
| --- | --- | --- |
| [cubing.js](https://js.cubing.net/cubing/scramble/) | `fto`の非同期生成API。Worker利用、FTOモデルとの連携が可能 | 練習アプリの初期実装に採用。npm版0.63.7で固定 |
| [TNoodle FTO PR #52](https://github.com/thewca/tnoodle-lib/pull/52) | GitHub公開APIでopen、merged_at=nullを確認。提案は3段階IDA*によるランダム状態生成 | 正式リリースを再確認して比較。現在の提案を「公式採用済み」と扱わない |
| [csTimer FTO solver](https://github.com/cs0x7f/cstimer/blob/master/src/js/solver/ftocta.js) | FTO実装を確認。導入したcubing.jsの配布コードにもcs0x7f由来のFTO実装が含まれる | 比較対象。ソースを直接移植せず、採用版の利用条件と状態モデルを確認 |

WCAの発表ではFTOは2027-01-02から公式競技に含められ、Ao5を使用する。FTO規則は2027年1月の規則改定に向けて整備されるため、確定規則の確認をリリース条件に含める。[WCA発表](https://www.worldcubeassociation.org/posts/changes-to-the-wca-s-list-of-official-events-june-2026)

cubing.jsのnpmメタデータは`MPL-2.0 OR GPL-3.0-or-later`。配布時は採用する条件と第三者コードの帰属を整理する。利用したコードを変更する際もライセンス表示を残す。[cubing.jsリポジトリ](https://github.com/cubing/cubing.js)

## 学習支援の参考

| 出典 | 確認した知見・機能 | アプリへの適用案 |
| --- | --- | --- |
| [hinemos](https://saxcy.info/hinemos/top.html) | 手順管理・クイズ・登録済み手順から解けるスクランブル・苦手手順の練習 | 学習済み集合での出題、ケース管理、隙間時間のクイズ |
| [Roediger & Karpicke, 2006](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/) | 文章学習で、想起テストが遅延後の保持を改善 | 答えを隠した状態での想起、回答後フィードバック |
| [Dunlosky et al., 2013](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html) | 練習テスト・分散学習を高く評価 | 復習キュー、日を分けた保持確認。交互練習は習熟度に応じて導入 |
| [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | TypeScriptの間隔反復スケジューラ | 学習イベント保存後の候補。FTO用の評価設計を検証してから採用 |

上記研究はFTO手順暗記・回転技能そのものの効果を保証しない。認識・想起と運動技能を分け、日をまたいだ保持・実戦での転移を測定する。アプリ側の間隔や苦手判定の閾値は検証対象の設計判断として扱う。

## 開発基盤の一次資料

[Node.js 24](https://nodejs.org/en/download/archive/v24)・[Vite](https://vite.dev/guide/)・[pnpm Workspace](https://pnpm.io/workspaces)・[pnpm設定](https://pnpm.io/settings)・[Dexie React](https://dexie.org/docs/Tutorial/React)・[Expo monorepo](https://docs.expo.dev/guides/monorepos/)。

依存バージョンはnpmの公開メタデータから確認して固定した。Dexie・PWA・Expo・FSRSは計画上の候補であり、今回の依存にはまだ追加していない。

### cubing.jsとViteのWorker配信

本番ブラウザ検証で、cubing.jsの間接的なWorker URLが通常のアプリchunkとして出力され、Worker内でDOMを参照する問題を確認した。`apps/web/build/cubing-worker.ts`で生成器のWorker URLをViteの`?worker&url`へ変換し、独立したWorkerビルドとして配信する。第三者ソースの実ファイルは変更しない。依存更新時はこの変換箇所と本番E2Eを再確認する。[ViteのWorker仕様](https://vite.dev/guide/features#web-workers)
