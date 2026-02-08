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
- サービス層: DB操作のユニットテスト（インメモリSQLite使用）
- APIエンドポイント: httpxによる統合テスト
- OpenAI連携: `unittest.mock.patch` でモック化
- SSEストリーミング: OpenAIをモックしてレスポンスとDB保存を検証

**フロントエンド (Vitest + Testing Library)**
- API層: MSWでAPIをモックしてテスト
- Hooks: Jotai stateを含むカスタムフックのテスト
- コンポーネント: ユーザーインタラクションのテスト
- SSEストリーミング（フロント側）: 複雑なため現在スコープ外

### テストファイル配置

- バックエンド: `backend/tests/test_*.py`
- フロントエンド: `frontend/src/**/__tests__/*.test.ts(x)`
