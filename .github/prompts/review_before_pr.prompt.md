---
agent: agent
description: mainブランチとの差分を取得してコードレビューを行う
argument-hint: 変更内容の説明（目的・範囲など）を入力してください
tools: [execute, read, agent, search, todo]
model: Claude Opus 4.6 (copilot)
---

# コードレビュースキル

以下2点を満たすコードレビューを行います。

- linterの実行結果から修正すべき内容をまとめる
- `main` ブランチとの差分を確認し、このプロジェクトの規約・品質基準に沿ったコードレビューを行う

## ワークフロー

### Step 1: linterの実行とレビュー

`#tool:agent/runSubagent` を使用して、linter_review サブエージェントを呼び出す。

- 対象エージェント: linter_review.agent.md

### Step 2: AIレビュー

`#tool:agent/runSubagent` を使用して、ai_review サブエージェントを呼び出す。

- 入力: ユーザーからの変更内容の説明（目的・範囲など）が存在すれば、それを入力として使用。
- 対象エージェント: ai_review.agent.md

## Step 3: レビュー結果のまとめ

各エージェントからの出力を受け取り、レビュー結果の要約とファイル名をユーザーに報告してください。
