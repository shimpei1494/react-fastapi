---
name: code-reviewer
description: Systematic code review for this React + FastAPI project. Reviews security, correctness, performance, and style. Use when finishing a feature, before merging, or when asked to review code.
---

# Code Reviewer

このプロジェクト（React + FastAPI）向けのコードレビュースキル。変更されたコードを体系的にレビューし、問題を severity 別に報告する。

## いつ使うか

- featureブランチ実装後のセルフレビュー
- PR マージ前の最終チェック
- 「このコードをレビューして」と言われたとき

---

## レビュー手順

### Step 1: 変更範囲の把握

```bash
git diff --stat HEAD
git diff HEAD
```

変更ファイルを確認し、バックエンド・フロントエンドどちらの変更か把握する。

---

### Step 2: 静的解析を実行

```bash
make fix
```

エラー・警告がゼロになるまで修正してから次のステップへ進む。

---

### Step 3: テストを実行

```bash
make test
```

すべてのテストがパスすることを確認する。失敗があれば先に修正する。

---

### Step 4: チェックリストでレビュー

変更内容に応じて該当セクションを確認する。

#### 共通チェック

- [ ] 不要な `console.log` / `print` / デバッグコードが残っていない
- [ ] ハードコードされたシークレット・APIキー・パスワードがない
- [ ] エラーハンドリングが適切に実装されている
- [ ] 変数名・関数名が意図を明確に表している

#### バックエンド（Python / FastAPI）

**セキュリティ**
- [ ] SQLインジェクション対策: SQLAlchemy ORM または parameterized query を使用
- [ ] 入力バリデーション: Pydantic スキーマで検証している
- [ ] 認証・認可: 必要なエンドポイントに依存性注入で保護されている

**正確性**
- [ ] 非同期関数 (`async def`) の中で同期ブロッキング処理を呼んでいない
- [ ] DB セッションが適切にクローズされる（`Depends(get_db)` 使用）
- [ ] 例外は `HTTPException` で適切なステータスコードを返す

**テスト**
- [ ] `tests/` 配下に対応するテストファイルがある
- [ ] 新しいサービスメソッドにユニットテストがある
- [ ] 新しいエンドポイントに統合テストがある

#### フロントエンド（React / TypeScript）

**セキュリティ**
- [ ] `dangerouslySetInnerHTML` を使っていない（使う場合はサニタイズ済み）
- [ ] ユーザー入力をそのままURLや評価に使っていない

**正確性**
- [ ] `useEffect` の依存配列が正しい
- [ ] 非同期処理のエラーが `try/catch` またはエラーバウンダリで捕捉されている
- [ ] メモリリーク防止: コンポーネントアンマウント時にクリーンアップしている

**パフォーマンス**
- [ ] 不必要な再レンダリングを引き起こしていない（`useMemo` / `useCallback` の使いどころ）
- [ ] 大きなリストに仮想化（virtualization）が必要か検討した

**テスト**
- [ ] `__tests__/` 配下に対応するテストファイルがある
- [ ] MSW でAPIモックが適切に設定されている

---

### Step 5: レポートを出力

以下のフォーマットで問題を報告する：

```
## コードレビュー結果

### 🔴 Critical（必ず修正）
- [ファイル:行] 問題の説明

### 🟡 Warning（修正を推奨）
- [ファイル:行] 問題の説明

### 🔵 Suggestion（改善案）
- [ファイル:行] 提案内容

### ✅ 良い点
- 良かった実装や判断を1〜3点挙げる

### 総評
X 件の Critical、Y 件の Warning、Z 件の Suggestion
```

---

## 優先順位

| Severity | 対応方針 |
|----------|----------|
| 🔴 Critical | マージ前に必ず修正。セキュリティ脆弱性・データ破壊リスク・テスト失敗など |
| 🟡 Warning | 強く推奨。バグの可能性・パフォーマンス問題・コードの意図が不明瞭 |
| 🔵 Suggestion | 任意。可読性向上・将来の保守性改善など |
