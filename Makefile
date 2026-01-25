help:
	@echo "Available commands:"
	@echo "  make dev            - Start development server for both web and API"
	@echo "  make dev-web        - Start development server for web"
	@echo "  make dev-api        - Start development server for API"
	@echo "  make build          - Build both web and API"
	@echo "  make build-web      - Build web"
	@echo "  make build-api      - Build API"
	@echo "  make start         - Start the application"
	@echo "  make lint          - Run linter"
	@echo "  make lint-fix      - Fix linting issues"
	@echo "  make format        - Format code"
	@echo "  make format-check  - Check code formatting"
	@echo "  make typecheck     - Run type checking"
	@echo "  make db-generate   - Generate database client"
	@echo "  make db-migrate    - Run database migrations"
	@echo "  make db-studio     - Open database studio"
	@echo "  make db-push       - Push database schema changes"
	@echo "  make db-pull       - Pull database schema changes"


dev:
	bun run dev

dev-web:
	bun run dev:web

dev-api:
	bun run dev:api

build:
	bun run build

build-web:
	bun run build:web

build-api:
	bun run build:api

start:
	bun run start

lint:
	bun run lint

lint-fix:
	bun run lint:fix

format:
	bun run format

format-check:
	bun run format:check

typecheck:
	bun run typecheck

db-generate:
	bun run db:generate

db-migrate:
	bun run db:migrate

db-studio:
	bun run db:studio

db-push:
	bun run db:push

db-pull:
	bun run db:pull

.PHONY: dev dev-web dev-api build build-web build-api start lint lint-fix format format-check typecheck db-generate db-migrate db-studio db-push db-pull
