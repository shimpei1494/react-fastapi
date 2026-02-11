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

## Azure App Service へのデプロイ

### 1. ビルド

```bash
./build.sh
```
実行されること
- pyproject.tomlとuv.lockから本番用のrequirements.txtを自動生成（開発用依存関係は除外）
- フロントエンドをビルドして `backend/static` にコピー

### 2. VS Code からデプロイ

1. VS Code のサイドバーで「Azure」アイコンをクリック
2. **App Service** セクションを展開
3. `backend` フォルダを右クリック → **Deploy to Web App...** を選択
4. デプロイ先の App Service リソースを選択
5. 「Deploy」を確認してデプロイ実行

または、コマンドパレット（Cmd+Shift+P）で `Azure App Service: Deploy to Web App...` を実行してください。
