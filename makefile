# 開発サーバー起動
dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

# Lint + Format（チェックのみ）
lint:
	cd frontend && npm run lint
	cd backend && uv run ruff check

# Lint + Format（自動修正）
fix:
	cd frontend && npm run lint:fix && npm run format
	cd backend && uv run ruff check --fix && uv run ruff format
