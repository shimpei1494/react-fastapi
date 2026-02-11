#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# フロントエンドビルド
cd "$SCRIPT_DIR/frontend"
npm ci
npm run build

# ビルド成果物を backend/static にコピー
rm -rf "$SCRIPT_DIR/backend/static"
cp -r dist "$SCRIPT_DIR/backend/static"

echo "Build complete: backend/static/"
