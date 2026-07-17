# Personal Template Monorepo Makefile
# Enables easy multi-service orchestration for development, testing, linting, and building.

SHELL := /bin/bash

# Colors for terminal output
COLOR_RESET   := \033[0m
COLOR_INFO    := \033[36m
COLOR_SUCCESS := \033[32m
COLOR_WARN    := \033[33m
COLOR_ERROR   := \033[31m

.PHONY: help setup dev dev-backend dev-frontend stop migrate migrate-new seed test test-backend lint clean build docker-compose-up wait-db generate-client watch-client

help: ## Show all targets with descriptions
	@echo -e "$(COLOR_WARN)Note for Windows Users: Please run these 'make' commands in Git Bash or WSL.$(COLOR_RESET)"
	@echo -e "$(COLOR_INFO)Available targets:$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(COLOR_INFO)%-15s$(COLOR_RESET) %s\n", $$1, $$2}'

setup: ## Install all dependencies (npm install at root, pip install for each python service venv)
	@echo -e "$(COLOR_INFO)Installing npm dependencies at monorepo root...$(COLOR_RESET)"
	npm install
	@echo -e "$(COLOR_INFO)Setting up services/backend virtual environment & dependencies...$(COLOR_RESET)"
	cd services/backend && python3 -m venv venv && ./venv/bin/pip install --upgrade pip && ./venv/bin/pip install -r requirements.txt -r requirements-dev.txt
	@echo -e "$(COLOR_SUCCESS)Setup complete!$(COLOR_RESET)"

setup-sprint0: ## Create personal ideation folder for Sprint 0 based on Git username
	@echo -e "$(COLOR_INFO)Setting up Sprint 0 Ideation folder...$(COLOR_RESET)"
	@GIT_USER=$$(git config user.name); \
	if [ -z "$$GIT_USER" ]; then \
		echo -e "$(COLOR_WARN)Git user.name not found! Using 'unknown_member'$(COLOR_RESET)"; \
		GIT_USER="unknown_member"; \
	fi; \
	mkdir -p "docs/ideation/$$GIT_USER"; \
	echo -e "$(COLOR_SUCCESS)Created docs/ideation/$$GIT_USER$(COLOR_RESET)"

.pids:
	@mkdir -p .pids

dev-backend: .pids ## Start only backend services (uvicorn) pointing to remote DB
	@echo -e "$(COLOR_INFO)Starting Backend service on port 8002...$(COLOR_RESET)"
	@cd services/backend && source venv/bin/activate && uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload > ../../.pids/backend.log 2>&1 & echo $$! > ../../.pids/backend.pid
	@echo -e "$(COLOR_SUCCESS)Backend services started!$(COLOR_RESET)"

dev-frontend: .pids ## Start only frontend apps
	@echo -e "$(COLOR_INFO)Starting @app/web on port 5173...$(COLOR_RESET)"
	@cd apps/web && npm run dev -- --port 5173 > ../../.pids/web.log 2>&1 & echo $$! > ../../.pids/web.pid
	@echo -e "$(COLOR_SUCCESS)Frontend applications started!$(COLOR_RESET)"

dev: dev-backend dev-frontend ## Start backend and web using background processes (uses remote DB)

stop: ## Stop all processes and docker-compose down
	@echo -e "$(COLOR_WARN)Stopping background services...$(COLOR_RESET)"
	@if [ -f .pids/backend.pid ]; then kill $$(cat .pids/backend.pid) 2>/dev/null || true; rm -f .pids/backend.pid; fi
	@if [ -f .pids/web.pid ]; then kill $$(cat .pids/web.pid) 2>/dev/null || true; rm -f .pids/web.pid; fi
	@echo -e "$(COLOR_WARN)Cleaning up dangling ports (8002, 5173)...$(COLOR_RESET)"
	@for port in 8002 5173; do \
		pid=$$(lsof -t -i:$$port 2>/dev/null); \
		if [ ! -z "$$pid" ]; then \
			echo "Killing process $$pid on port $$port..."; \
			kill -9 $$pid 2>/dev/null || true; \
		fi; \
	done
	@echo -e "$(COLOR_SUCCESS)All services stopped!$(COLOR_RESET)"

migrate: ## Run alembic upgrade head
	@echo -e "$(COLOR_INFO)Running alembic upgrade head...$(COLOR_RESET)"
	cd services/backend && source venv/bin/activate && alembic upgrade head

migrate-new: ## Run alembic revision --autogenerate with message arg (usage: make migrate-new m="migration_message")
	@if [ -z "$(m)" ]; then \
		echo -e "$(COLOR_ERROR)Error: Migration message 'm' is required. Usage: make migrate-new m=\"message\"$(COLOR_RESET)"; \
		exit 1; \
	fi
	@echo -e "$(COLOR_INFO)Generating new alembic migration: $(m)...$(COLOR_RESET)"
	cd services/backend && source venv/bin/activate && alembic revision --autogenerate -m "$(m)"

seed: migrate ## Run database seeder script
	@echo -e "$(COLOR_INFO)Seeding the database...$(COLOR_RESET)"
	cd services/backend && source venv/bin/activate && python -m scripts.seed

test: test-backend ## Run all tests (pytest for backends, npm test for frontends)
	@echo -e "$(COLOR_INFO)Running frontend tests...$(COLOR_RESET)"
	npm test --workspaces --if-present

test-backend: ## Run Backend service tests
	@echo -e "$(COLOR_INFO)Running Backend service tests...$(COLOR_RESET)"
	cd services/backend && source venv/bin/activate && pytest

lint: ## Run linting (ruff for python, oxlint for frontend)
	@echo -e "$(COLOR_INFO)Linting Python services with Ruff...$(COLOR_RESET)"
	./services/backend/venv/bin/ruff check services/backend
	@echo -e "$(COLOR_INFO)Linting Frontend apps with Oxlint...$(COLOR_RESET)"
	npm run lint --workspaces --if-present

clean: ## Remove venvs, node_modules, __pycache__, dist/
	@echo -e "$(COLOR_WARN)Cleaning up build artifacts and dependencies...$(COLOR_RESET)"
	rm -rf node_modules .pids
	rm -rf apps/*/node_modules apps/*/dist
	rm -rf packages/*/node_modules packages/*/dist
	rm -rf services/backend/venv
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +

build: ## Build all Docker images
	@echo -e "$(COLOR_INFO)Building services/backend image...$(COLOR_RESET)"
	docker build -t service-backend:latest -f services/backend/Dockerfile .

	@echo -e "$(COLOR_INFO)Building apps/web image...$(COLOR_RESET)"
	docker build -t app-web:latest -f apps/web/Dockerfile .

generate-client: ## Generate OpenAPI spec and TypeScript client
	@if [ ! -d "services/backend/venv" ]; then \
		echo -e "$(COLOR_ERROR)Error: Backend venv not found. Please run 'make setup' first.$(COLOR_RESET)"; \
		exit 1; \
	fi
	@echo -e "$(COLOR_INFO)Exporting OpenAPI spec...$(COLOR_RESET)"
	./services/backend/venv/bin/python export_openapi.py backend
	@echo -e "$(COLOR_INFO)Generating TypeScript client...$(COLOR_RESET)"
	cd apps/web && npx openapi-ts
	@echo -e "$(COLOR_SUCCESS)Client generation complete!$(COLOR_RESET)"

watch-client: ## Watch backend for changes and auto-regenerate TypeScript client
	@echo -e "$(COLOR_INFO)Watching backend for changes to auto-generate client...$(COLOR_RESET)"
	npx chokidar-cli "services/backend/src/api/**/*.py" "services/backend/src/schemas/**/*.py" -c "make generate-client"

