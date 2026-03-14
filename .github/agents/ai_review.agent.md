---
description: mainブランチとの差分を取得してコードレビューを行う
tools: [execute, read, agent, edit/createFile, edit/editFiles, edit/rename, search, todo]
model: Claude Sonnet 4.6 (copilot)
user-invocable: false
---

# コードレビュースキル

`main` ブランチとの差分を確認し、このプロジェクトの規約・品質基準に沿ったコードレビューを行います。

## ワークフロー

### Step 1: 差分の取得

まず変更ファイル一覧を確認します（レビュー対象拡張子のみ）：
※ ブランチ一覧を取得するコマンドや拡張子指定をなくしたgit diffコマンドを実行する必要はありません。

```bash
git diff origin/main...HEAD --name-only -- '*.py' '*.ts' '*.tsx' '*.css' '*.html'
```

- ファイル数が **10件以下** の場合: 全差分を一度に取得
```bash
git diff origin/main...HEAD -- '*.py' '*.ts' '*.tsx' '*.css' '*.html'
```

- ファイル数が **11件以上** の場合: ファイルごとに個別取得
```bash
git diff origin/main...HEAD -- <ファイルパス>
```

### Step 2: 変更内容の把握

> ユーザーが変更内容（目的・範囲など）をすでに記載している場合は、このステップをスキップしてください。

各変更ファイルを読み込み、以下を把握します：

- 変更の目的・範囲（新機能 / バグ修正 / リファクタリング）
- バックエンド（`backend/`）か フロントエンド（`frontend/`）か、あるいは両方

### Step 3: レビュー実施

下記の観点でレビューし、問題を発見した場合はファイルパスと行番号とともに報告します。
#file:../../docs/review/review_point.md


## Step 4: レビュー結果のファイル出力

以下のフォーマットでレビューをファイル出力します。
#file:../../docs/review/review_output_format.md

`.review_report`ディレクトリに`ai_review_日付時刻.md`の形式でファイルを出力してください。
※`.review_report`ディレクトリは作成済みなので新規作成不要

## Step 5: レビュー結果の要約を報告
出力ファイル名とともに、レビュー結果の要約をユーザーに報告してください。
