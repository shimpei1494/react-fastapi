# react-fastapi

React + FastAPI のフルスタックプロジェクト。

## 開発サーバーの起動

### make を使う場合

```bash
# フロントエンド（http://localhost:5173）
make dev-frontend

# バックエンド（http://localhost:8000）
make dev-backend
```

### make を使わない場合

```bash
# フロントエンド（http://localhost:5173）
cd frontend && npm run dev

# バックエンド（http://localhost:8000）
cd backend && uv run uvicorn app.main:app --reload --port 8000

# または Python から直接実行（IDEのデバッガ向け）
cd backend && uv run python -m app.main
```

## Lint / Format

```bash
# チェックのみ
make lint

# 自動修正
make fix
```
