# VS Code launch.json 運用ガイド

## 目的

このリポジトリでは、VS Code の Run and Debug から以下をそのまま扱える状態を目指します。

- FastAPI を Python デバッガ付きで起動する
- Vite + React を Chrome デバッガ付きで起動する
- フロントエンドとバックエンドをまとめて起動する

今回のリポジトリでは、以下の 2 つを標準構成とします。

- Backend: FastAPI
- Frontend: Debug (Chrome)
- Full Stack: Frontend + Backend

## このプロジェクトの前提

このリポジトリはモノレポ構成で、実際の起動ポイントは次のとおりです。

- フロントエンド: [frontend/package.json](frontend/package.json)
- バックエンドの ASGI アプリ: [backend/app/main.py](backend/app/main.py#L1)
- FastAPI の import パス: `app.main:app`

バックエンドは [makefile](makefile#L1) では `uv run uvicorn app.main:app --reload --port 8000` で起動します。一方で VS Code のデバッグ設定は、デバッグ安定性を優先して `uvicorn` を直接起動し、使用する Python を `backend/.venv` に固定しています。

## 採用した設定

追加したファイルは次の 3 つです。

- [.vscode/launch.json](.vscode/launch.json)
- [.vscode/tasks.json](.vscode/tasks.json)
- [docs/vscode-launch-json-guide.md](docs/vscode-launch-json-guide.md)

### launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Backend: FastAPI",
      "type": "debugpy",
      "request": "launch",
      "python": "${workspaceFolder}/backend/.venv/bin/python",
      "module": "uvicorn",
      "cwd": "${workspaceFolder}/backend",
      "args": [
        "app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000"
      ],
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend",
        "PYTHONUNBUFFERED": "1"
      },
      "console": "integratedTerminal",
      "justMyCode": true
    },
    {
      "name": "Frontend: Debug (Chrome)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend",
      "sourceMapPathOverrides": {
        "/@fs/*": "/*"
      },
      "preLaunchTask": "frontend: dev"
    }
  ],
  "compounds": [
    {
      "name": "Full Stack: Frontend + Backend",
      "configurations": [
        "Backend: FastAPI",
        "Frontend: Debug (Chrome)"
      ],
      "stopAll": true
    }
  ]
}
```

### tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "frontend: dev",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "isBackground": true,
      "problemMatcher": {
        "owner": "custom",
        "pattern": {
          "regexp": "^[Ee][Rr][Rr][Oo][Rr][: ]+(.*)$",
          "message": 1
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": ".+",
          "endsPattern": "Local:\\s+http://localhost:5173/|Local:\\s+http://127\\.0\\.0\\.1:5173/"
        }
      },
      "presentation": {
        "reveal": "always",
        "panel": "dedicated",
        "clear": false
      }
    }
  ]
}
```

## 設定の意図

### Backend: FastAPI

- `cwd` は `backend` に固定しています
- `python` を `backend/.venv/bin/python` に固定しています
- `module: "uvicorn"` で Python モジュールとして起動します
- ASGI アプリ指定は `app.main:app` です
- `PYTHONPATH` に `backend` を入れて import の解決を安定させています

`uv run` はターミナルの手動起動には便利ですが、Python デバッグ設定で `module: "uv"` にすると `python -m uv ...` として解釈されます。このリポジトリの `.venv` では `uv` モジュールが import できないため、VS Code のデバッグ起動では採用していません。

`--reload` はあえて入れていません。VS Code の Python デバッグでは、自動リロードがサブプロセスを作るため、ブレークポイントや停止挙動が不安定になることがあるためです。まずは「確実に止まる」ことを優先しています。

### Frontend: Debug (Chrome)

- 開発サーバーの URL は Vite の既定値である `http://localhost:5173`
- `webRoot` は `frontend` に固定しています
- `preLaunchTask` で Vite を必要時に起動します
- `sourceMapPathOverrides` により Vite が `/@fs/` プレフィックスで配信するファイルのソースマップを VS Code が正しく解釈できます
- `frontend/src/` 以下の `.tsx` / `.ts` ファイルに直接ブレークポイントを置けば、TypeScript コードで停止できます

`tasks.json` の problem matcher は、Vite の起動完了を検知するために使っています。ただし通常のログや Node の警告まで Problems ビューに出すとノイズが大きいため、`ERROR:` や `error ` で始まる行だけを問題として拾うようにしています。

`presentation` 設定により、Vite のログが専用パネルに常時表示されます。

### Full Stack: Frontend + Backend

- バックエンドとブラウザ起動をまとめています
- `stopAll: true` により片方を停止すると両方止まります

## 使い方

### 1. バックエンドだけデバッグする

Run and Debug で `Backend: FastAPI` を選んで F5 を押します。

確認ポイント:

- Python のブレークポイントで停止する
- `http://127.0.0.1:8000/api/health` が返る

### 2. フロントエンドをデバッグする

Run and Debug で `Frontend: Debug (Chrome)` を選んで F5 を押します。

この設定は起動前に `frontend: dev` タスクを実行するため、別ターミナルで手動起動しなくても使えます。

確認ポイント:

- Vite 開発サーバーが起動する
- Chrome で `http://localhost:5173` が開く
- `frontend/src/` 以下の TypeScript/React コードでブレークポイントが停止する

> **注意:** デバッグセッションを停止しても Vite dev server は起動したままになります。
> 止めるには `Terminal > Run Task > Terminate Task` を使うか、Tasks ターミナルで `Ctrl+C` してください。

### 3. フルスタックで起動する

Run and Debug で `Full Stack: Frontend + Backend` を選んで F5 を押します。

これで FastAPI と Chrome デバッガをまとめて起動できます。Python のブレークポイントと TypeScript のブレークポイントを同時に使えます。

## このプロジェクトでの注意点

### Python 仮想環境が壊れている場合

このリポジトリでは `backend/.venv` の中に古い絶対パスが残り、`uv run` や関連エントリポイントが壊れることがあります。もし Python 側のデバッグ起動でインタープリタ関連のエラーが出る場合は、`backend` 配下で仮想環境を作り直してください。

例:

```bash
cd backend
rm -rf .venv
uv sync
```

### React 側のブレークポイントが効かない場合

確認する点:

- Vite が `5173` で起動しているか
- `webRoot` が `frontend` になっているか
- Chrome で開いている URL が `http://localhost:5173` か
- `sourceMapPathOverrides` に `"/@fs/*": "/*"` が設定されているか

### FastAPI 側で import エラーが出る場合

確認する点:

- `cwd` が `backend` になっているか
- アプリ指定が `app.main:app` になっているか
- [ .vscode/launch.json ](.vscode/launch.json#L5) の `python` が `backend/.venv/bin/python` を向いているか

## 今後の拡張候補

必要なら次を追加できます。

- Backend: FastAPI (Reload)
- Backend: Pytest
- Frontend: Edge（`type: "msedge"` に変えるだけ）
- envFile を使った `.env` 読み込み
- ポート違いのバックエンド設定

## まとめ

このリポジトリでは、モノレポ向けの最小構成として次を整備しました。

- FastAPI の安定した Python デバッグ起動
- Vite の自動起動付き Chrome デバッグ起動（TypeScript ブレークポイント対応）
- フルスタックの compound 起動（Python + TypeScript を同時にデバッグ可能）

まずはこの構成で運用し、必要になった段階で reload やテスト起動設定を足すのが安全です。