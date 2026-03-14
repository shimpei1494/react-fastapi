---
description: Biome（フロントエンド）とruff（バックエンド）のLinter実行結果をレビューするエージェント
tools: [execute, read, agent, edit/createFile, edit/editFiles, edit/rename, search, todo]
model: Claude Sonnet 4.6 (copilot)
user-invocable: false
---

# Linter レビュースキル

`main` ブランチとの差分ファイルに対して Biome (TypeScript/TSX) と ruff (Python) を実行し、修正が推奨される箇所をまとめて報告します。

## ワークフロー

### Step 1: 差分ファイルの取得

フロントエンドとバックエンドそれぞれの変更ファイルを取得します。

**フロントエンド (.ts / .tsx)**:
```bash
git diff origin/main...HEAD --name-only -- '*.ts' '*.tsx'
```

**バックエンド (.py)**:
```bash
git diff origin/main...HEAD --name-only -- '*.py'
```

変更ファイルが存在しないカテゴリは以降のステップをスキップします。
※ ブランチ一覧を取得するコマンドや拡張子指定をなくしたgit diffコマンドを実行する必要はありません。

---

### Step 2: フロントエンド Linter (Biome) の実行

Step 1 で取得した `.ts` / `.tsx` ファイルに対して Biome を実行します。

Git diff で得られるパスは `src/frontend/src/...` 形式のため、`src/frontend/` を除いた相対パスを使用します。

**変更ファイルが1件以上ある場合**:
```bash
cd src/frontend
npx biome lint <ファイル1> <ファイル2> ... --diagnostic-level info
```

例）`src/frontend/src/components/Foo.tsx` → `src/components/Foo.tsx` として渡す
※ `npm run lint` を実行すると全ファイルが対象になってしまうため、npx biome lintで個別に実行する

**変更ファイルがない場合**: このステップをスキップします。

---

### Step 3: バックエンド Linter (ruff) の実行

Step 1 で取得した `.py` ファイルに対して ruff を実行します。

Git diff で得られるパスは `src/backend/...` 形式のため、`src/backend/` を除いた相対パスを使用します。

**変更ファイルが1件以上ある場合**:
```bash
cd src/backend
ruff check <ファイル1> <ファイル2> ...
```

例）`src/backend/routers/chat.py` → `routers/chat.py` として渡す
※ `ruff check .` を実行すると全ファイルが対象になってしまうため、ruff checkで個別に実行する
※ `\backend_env\Scripts\Activate.ps1` のような仮想環境を有効化するようなコマンドは不要

**変更ファイルがない場合**: このステップをスキップします。

---

### Step 4: 結果のファイル出力

以下のフォーマットで結果をファイル出力します。
`.review_report` ディレクトリに `linter_review_日付時刻.md` の形式でファイルを出力してください。
※ `.review_report` ディレクトリは作成済みなので新規作成不要

---

## Linter レビュー結果

### 対象ファイル

**フロントエンド (.ts / .tsx)**:
- `src/frontend/src/...`（変更ファイルを列挙、なければ「変更なし」）

**バックエンド (.py)**:
- `src/backend/...`（変更ファイルを列挙、なければ「変更なし」）

---

### Biome（フロントエンド）

> 変更ファイルがない場合は「対象ファイルなし」と記載してスキップ

| ファイル | 行 | ルール | 内容 | 推奨対応 |
|---|---|---|---|---|
| `src/frontend/src/...` | L00 | `ruleName` | エラー内容 | 修正例または対応方針 |

指摘がない場合: **問題なし**

---

### ruff（バックエンド）

> 変更ファイルがない場合は「対象ファイルなし」と記載してスキップ

| ファイル | 行 | ルール | 内容 | 推奨対応 |
|---|---|---|---|---|
| `src/backend/...` | L00 | `E501` | エラー内容 | 修正例または対応方針 |

指摘がない場合: **問題なし**

---

### サマリー

| カテゴリ | 対象ファイル数 | 指摘件数 |
|---|---|---|
| フロントエンド（Biome） | 0 | 0 |
| バックエンド（ruff） | 0 | 0 |

> **error / warning レベルの指摘は対応を推奨します。** `info` レベルは任意対応です。

## Step 5: レビュー結果の要約を報告

出力ファイル名とともに、レビュー結果のサマリーのみをユーザーに報告してください。
