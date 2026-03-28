# テストガイド

## テスト実行

```bash
# すべてのテストを実行
make test

# バックエンドのみ
make test-backend

# フロントエンドのみ
make test-frontend
```

## テスト方針（全体）

このプロジェクトは**古典学派（Chicago派）**ベースのアプローチを採用している。
できるだけ本物のロジックを動かし、外部境界（外部API・HTTP通信）のみをモック化する。

```
コンポーネント
    ↓
カスタムフック
    ↓
APIクライアント        ← フロントエンドの外部境界（MSWでモック）
    ↓ HTTP
APIルーター
    ↓
サービス層
    ↓
DB（インメモリSQLite）  ← バックエンドの外部境界（テスト用DBで代替）
    ↓
外部API（OpenAI）       ← 外部境界（patchでモック）
```

## バックエンド

- **フレームワーク**: pytest + pytest-asyncio
- **テスト環境**: インメモリ SQLite（テストごとにテーブルを作成・破棄）
- **テスト全体の共通設定**: `backend/tests/conftest.py`

### テストの種類

| 種類 | 対象 | 方針 |
|---|---|---|
| ユニットテスト | サービス層 | 本物のDBセッション（インメモリSQLite）を使って動作を検証 |
| 統合テスト | APIルーター | HTTPクライアント（httpx）で実際にAPIを叩いてレスポンスを検証 |

### モックの使い方

- **DB** : 本物のSQLiteをインメモリで起動して使う（モックしない）
- **外部API（OpenAI）** : `unittest.mock.patch` で偽の応答を返す

## フロントエンド

- **フレームワーク**: Vitest + Testing Library
- **テスト環境**: jsdom（ブラウザの模擬環境）
- **共通ラッパー**: Jotai・Mantine・React Router を含むテスト用 Provider を `src/test/test-utils.tsx` に用意

### テストの種類

| 種類 | 対象 | 方針 |
|---|---|---|
| ユニットテスト | APIクライアント | MSWで偽のサーバーレスポンスを返し、fetch ラッパーの動作を検証 |
| フックテスト | カスタムフック | `renderHook` で実際のフックを動かし、状態の変化を検証 |
| コンポーネントテスト | UIコンポーネント | 実際にレンダリングしてユーザー操作（入力・クリック）を再現し結果を検証 |

### モックの使い方

- **HTTP通信** : [MSW (Mock Service Worker)](https://mswjs.io/) でリクエストをインターセプトして偽のレスポンスを返す
- **コンポーネント内の関数** : `vi.fn()` で偽の関数を渡して、呼ばれたかどうかを検証

### 現在スコープ外

- SSEストリーミング（`useStreamMessage`）: 複雑なため現在はテスト対象外

## ディレクトリ構成の規則

### バックエンド

- `backend/tests/` 以下に `backend/app/` の構造をミラーして配置する
- 例: `app/services/foo_service.py` → `tests/services/test_foo_service.py`

### フロントエンド

- テスト対象のコードと同じディレクトリ内に `__tests__/` サブディレクトリを作って配置する
- 例: `hooks/useFoo.ts` → `hooks/__tests__/useFoo.test.tsx`
