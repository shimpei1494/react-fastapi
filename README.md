# react-fastapi

React + FastAPI のフルスタックプロジェクト。

## セットアップ（初回）

### 1. 前提ツールのインストール

| ツール | 用途 | インストール方法 |
|--------|------|-----------------|
| [uv](https://docs.astral.sh/uv/) | Python パッケージ管理 | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Node.js (v20+) | フロントエンド実行環境 | [公式サイト](https://nodejs.org/) または `brew install node` |

### 2. 依存関係のインストール

```bash
make install
```

または個別に:

```bash
make install-backend   # Python パッケージ（uv sync）
make install-frontend  # npm パッケージ（npm install）
```

### 3. 環境変数の設定

```bash
cp backend/.env.example backend/.env
```

`backend/.env` を編集して `OPENAI_API_KEY` に実際の API キーを設定する。

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
