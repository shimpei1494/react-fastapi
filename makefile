# 開発サーバー起動
dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

# テスト実行
test-frontend:
	cd frontend && npm test

test-backend:
	cd backend && uv run pytest

test:
	make test-backend
	make test-frontend

# カバレッジ計測（参考用）
coverage-frontend:
	cd frontend && npx vitest run --coverage

coverage-backend:
	cd backend && uv run pytest --cov=app --cov-report=term-missing

coverage:
	make coverage-backend
	make coverage-frontend

# Lint + Format（チェックのみ）
lint-frontend:
	cd frontend && npm run lint

lint-backend:
	cd backend && uv run ruff check && uv run pyright

lint:
	make lint-frontend
	make lint-backend

# Lint + Format（自動修正）
fix:
	cd frontend && npm run lint:fix && npm run format
	cd backend && uv run ruff check --fix && uv run ruff format
