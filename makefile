# リンター実行
lint: lint-frontend lint-backend

lint-frontend:
	cd frontend && npm run lint

lint-backend:
	cd backend && uv run ruff check

# フォーマット実行
format: format-frontend format-backend

format-frontend:
	cd frontend && npm run format

format-backend:
	cd backend && uv run ruff format
