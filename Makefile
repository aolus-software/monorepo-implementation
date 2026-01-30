.PHONY: help dev dev-web dev-api build build-web build-api build-packages start lint lint-fix format format-check typecheck clean clean-dist clean-all clean-build clean-typecheck db-generate db-migrate db-studio db-push db-pull

help:
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start development server for both web and API"
	@echo "  make dev-web        - Start development server for web apps"
	@echo "  make dev-api        - Start development server for API apps"
	@echo ""
	@echo "Build:"
	@echo "  make build          - Build all packages and apps in correct order"
	@echo "  make build-packages - Build only shared packages"
	@echo "  make build-web      - Build web apps"
	@echo "  make build-api      - Build API apps"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint           - Run linter"
	@echo "  make lint-fix       - Fix linting issues"
	@echo "  make format         - Format code"
	@echo "  make format-check   - Check code formatting"
	@echo "  make typecheck      - Run type checking"
	@echo ""
	@echo "Clean:"
	@echo "  make clean          - Clean all build artifacts (dist, tsbuildinfo)"
	@echo "  make clean-dist     - Clean only dist folders"
	@echo "  make clean-all      - Clean everything (node_modules, dist, lockfile)"
	@echo "  make clean-build    - Clean and rebuild all"
	@echo "  make clean-typecheck - Clean, build, and typecheck"
	@echo ""
	@echo "Database:"
	@echo "  make db-generate    - Generate database migrations"
	@echo "  make db-migrate     - Run database migrations"
	@echo "  make db-studio      - Open database studio"
	@echo "  make db-push        - Push database schema changes"
	@echo "  make db-pull        - Pull database schema changes"
	@echo ""
	@echo "Other:"
	@echo "  make start          - Start the application"
	@echo "  make install        - Install dependencies"

# Development
dev:
	bun run dev

dev-web:
	bun run dev:web

dev-api:
	bun run dev:api

# Build
build:
	@echo "🔨 Building packages in order..."
	@bun run build --filter="@repo/config"
	@bun run build --filter="@repo/types"
	@bun run build --filter="@repo/utils"
	@bun run build --filter="@repo/env"
	@bun run build --filter="@repo/elysia"
	@bun run build --filter="@repo/database"
	@bun run build --filter="@repo/ui"
	@echo "🔨 Building apps..."
	@bun run build --filter="@repo/api-*"
	@bun run build --filter="@repo/web-*"
	@echo "✅ Build complete!"

build-packages:
	@echo "📦 Building shared packages..."
	@bun run build --filter="@repo/config"
	@bun run build --filter="@repo/types"
	@bun run build --filter="@repo/utils"
	@bun run build --filter="@repo/env"
	@bun run build --filter="@repo/elysia"
	@bun run build --filter="@repo/database"
	@bun run build --filter="@repo/ui"
	@echo "✅ Packages built!"

build-web:
	@bun run build:web

build-api:
	@bun run build:api

# Start
start:
	bun run start

# Code Quality
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

# Clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf packages/*/dist
	@rm -rf packages/*/*.tsbuildinfo
	@rm -rf apps/*/dist
	@rm -rf apps/*/*.tsbuildinfo
	@echo "✅ Clean complete!"

clean-dist:
	@echo "🧹 Cleaning dist folders..."
	@rm -rf packages/*/dist
	@rm -rf apps/*/dist
	@echo "✅ Dist folders cleaned!"

clean-all:
	@echo "🧹 Cleaning everything (node_modules, dist, lockfile)..."
	@rm -rf node_modules
	@rm -rf packages/*/node_modules
	@rm -rf apps/*/node_modules
	@rm -rf packages/*/dist
	@rm -rf apps/*/dist
	@rm -rf packages/*/*.tsbuildinfo
	@rm -rf apps/*/*.tsbuildinfo
	@rm -f bun.lockb
	@echo "✅ Everything cleaned!"

clean-build: clean-dist
	@echo "🔨 Rebuilding after clean..."
	@$(MAKE) build

clean-typecheck: clean-dist
	@echo "🔨 Clean, build, and typecheck..."
	@$(MAKE) build
	@$(MAKE) typecheck

# Database
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

# Installation
install:
	@echo "📦 Installing dependencies..."
	@bun install
	@echo "✅ Dependencies installed!"

# Convenience targets
rebuild: clean-build

fresh: clean-all install build
	@echo "✨ Fresh installation and build complete!"