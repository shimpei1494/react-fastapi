# プロジェクトルール

## コード品質

コードを修正・追加した後は、必ずプロジェクトルートで以下を実行し、エラーや警告がゼロの状態にすること。

```bash
make fix
```

自動修正で解消できない場合は、手動で修正してから再度実行すること。

## テスト

### テスト実行

```bash
# すべてのテストを実行
make test

# バックエンドのみ
make test-backend

# フロントエンドのみ
make test-frontend
```

### テスト方針

**バックエンド (pytest)**
- リポジトリ層: インメモリSQLiteを使ったDB操作のユニットテスト
- サービス層: インメモリSQLite + `FakeAIService` を使ったユースケーステスト
- APIエンドポイント: httpxによる統合テスト
- OpenAI連携: `FakeAIService` をDIで差し込んでモック化（`unittest.mock.patch` は使わない）
- SSEストリーミング: `FakeAIService` でレスポンスとDB保存を検証

**フロントエンド (Vitest + Testing Library)**
- API層: MSWでAPIをモックしてテスト
- Hooks: Jotai stateを含むカスタムフックのテスト
- コンポーネント: ユーザーインタラクションのテスト
- SSEストリーミング（フロント側）: 複雑なため現在スコープ外

### テストファイル配置

#### バックエンド: `backend/tests/**/test_*.py`
- `tests/` ディレクトリが `app/` ディレクトリの構造をミラーする形で配置
- 例: `app/services/thread_service.py` → `tests/services/test_thread_service.py`
- 例: `app/repositories/thread_repository.py` → `tests/repositories/test_thread_repository.py`
- テスト用共通フェイク: `tests/services/fake_ai.py`（`FakeAIService`）
#### フロントエンド: `frontend/src/**/__tests__/*.test.ts(x)`
- 各モジュール（api, hooks, componentsなど）配下に `__tests__` サブディレクトリを作成してテストを配置
- テストファイルはテスト対象のコードと同じディレクトリ階層内に併置する
- 例: `hooks/useThreads.ts` → `hooks/__tests__/useThreads.test.tsx`
