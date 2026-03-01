#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# バックエンドのrequirements.txt生成（本番用のみ）
cd "$SCRIPT_DIR/backend"
uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt

# フロントエンドビルド
cd "$SCRIPT_DIR/frontend"
npm ci
npm run build

# ビルド成果物を backend/static にコピー
rm -rf "$SCRIPT_DIR/backend/static"
cp -r dist "$SCRIPT_DIR/backend/static"

echo "Build complete: backend/static/"
