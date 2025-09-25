# Makefile for YouTube Stats App Docker Management
.PHONY: help build up down restart logs shell test clean dev prod migrate backup restore

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

## help: Show this help message
help:
	@echo "$(BLUE)YouTube Stats App - Docker Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Usage:$(NC)"
	@echo "  make [target]"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(BLUE)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Development

## dev: Start development environment with hot reload
dev:
	@echo "$(GREEN)🔧 Starting development environment...$(NC)"
	docker-compose up youtube-stats-dev

## dev-build: Build and start development environment
dev-build:
	@echo "$(GREEN)🔧 Building and starting development environment...$(NC)"
	docker-compose build youtube-stats-dev
	docker-compose up youtube-stats-dev

## dev-down: Stop development environment
dev-down:
	@echo "$(YELLOW)🛑 Stopping development environment...$(NC)"
	docker-compose down

##@ Production

## prod: Start production environment
prod:
	@echo "$(GREEN)🏭 Starting production environment...$(NC)"
	docker-compose --profile production up -d

## prod-build: Build and start production environment
prod-build:
	@echo "$(GREEN)🏭 Building and starting production environment...$(NC)"
	docker-compose --profile production build
	docker-compose --profile production up -d

## prod-down: Stop production environment
prod-down:
	@echo "$(YELLOW)🛑 Stopping production environment...$(NC)"
	docker-compose --profile production down

##@ Building

## build: Build Docker images
build:
	@echo "$(GREEN)🏗️  Building Docker images...$(NC)"
	docker-compose build

## build-no-cache: Build Docker images without cache
build-no-cache:
	@echo "$(GREEN)🏗️  Building Docker images without cache...$(NC)"
	docker-compose build --no-cache

##@ Container Management

## up: Start all services
up:
	@echo "$(GREEN)🚀 Starting all services...$(NC)"
	docker-compose up -d

## down: Stop all services
down:
	@echo "$(YELLOW)🛑 Stopping all services...$(NC)"
	docker-compose down

## restart: Restart all services
restart: down up
	@echo "$(GREEN)♻️  Services restarted$(NC)"

## ps: Show running containers
ps:
	@echo "$(BLUE)📦 Running containers:$(NC)"
	@docker-compose ps

## stop: Stop all services without removing
stop:
	@echo "$(YELLOW)⏸️  Stopping services...$(NC)"
	docker-compose stop

## start: Start stopped services
start:
	@echo "$(GREEN)▶️  Starting services...$(NC)"
	docker-compose start

##@ Logs and Monitoring

## logs: Show logs from all services
logs:
	docker-compose logs -f

## logs-backend: Show backend logs
logs-backend:
	docker-compose logs -f youtube-stats

## logs-dev: Show development logs
logs-dev:
	docker-compose logs -f youtube-stats-dev

##@ Shell Access

## shell: Open shell in production container
shell:
	@echo "$(BLUE)🐚 Opening shell in production container...$(NC)"
	docker-compose exec youtube-stats /bin/bash

## shell-dev: Open shell in development container
shell-dev:
	@echo "$(BLUE)🐚 Opening shell in development container...$(NC)"
	docker-compose exec youtube-stats-dev /bin/bash

## backend-shell: Open Python shell in backend
backend-shell:
	@echo "$(BLUE)🐍 Opening Python shell...$(NC)"
	docker-compose exec youtube-stats python

##@ Database

## migrate: Run database migrations
migrate:
	@echo "$(GREEN)🗄️  Running migrations...$(NC)"
	docker-compose exec youtube-stats /entrypoint.sh migrate

## db-up: Start database services (PostgreSQL and Redis)
db-up:
	@echo "$(GREEN)🗄️  Starting database services...$(NC)"
	docker-compose --profile database --profile cache up -d

## db-down: Stop database services
db-down:
	@echo "$(YELLOW)🗄️  Stopping database services...$(NC)"
	docker-compose --profile database --profile cache down

##@ Testing

## test: Run tests in container
test:
	@echo "$(GREEN)🧪 Running tests...$(NC)"
	docker-compose run --rm youtube-stats /entrypoint.sh test

## test-backend: Run backend tests
test-backend:
	@echo "$(GREEN)🧪 Running backend tests...$(NC)"
	docker-compose exec youtube-stats pytest -v

## test-frontend: Run frontend tests
test-frontend:
	@echo "$(GREEN)🧪 Running frontend tests...$(NC)"
	docker-compose exec youtube-stats-dev yarn test

##@ Cleanup

## clean: Remove all containers, volumes, and images
clean:
	@echo "$(RED)🧹 Cleaning up...$(NC)"
	@echo "$(YELLOW)⚠️  This will remove all containers, volumes, and images!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo ""; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v --rmi all; \
		echo "$(GREEN)✅ Cleanup complete$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled$(NC)"; \
	fi

## clean-volumes: Remove all volumes
clean-volumes:
	@echo "$(YELLOW)🗑️  Removing volumes...$(NC)"
	docker-compose down -v

## prune: Remove unused Docker resources
prune:
	@echo "$(YELLOW)🧹 Pruning unused Docker resources...$(NC)"
	docker system prune -af
	docker volume prune -f

##@ Backup and Restore

## backup: Backup application data
backup:
	@echo "$(GREEN)💾 Creating backup...$(NC)"
	@mkdir -p ./backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	tar -czf ./backups/backup_$$TIMESTAMP.tar.gz ./data ./logs; \
	echo "$(GREEN)✅ Backup created: backup_$$TIMESTAMP.tar.gz$(NC)"

## restore: Restore from backup (usage: make restore FILE=backup_20240101_120000.tar.gz)
restore:
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Error: Please specify backup file$(NC)"; \
		echo "$(YELLOW)Usage: make restore FILE=backup_20240101_120000.tar.gz$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📦 Restoring from $(FILE)...$(NC)"
	@tar -xzf ./backups/$(FILE)
	@echo "$(GREEN)✅ Restore complete$(NC)"

##@ Health and Status

## health: Check health of all services
health:
	@echo "$(BLUE)🏥 Checking service health...$(NC)"
	@curl -f http://localhost:8080/health || echo "$(RED)❌ Service is not healthy$(NC)"
	@curl -f http://localhost:8080/api/health || echo "$(RED)❌ API is not healthy$(NC)"

## status: Show detailed status of services
status:
	@echo "$(BLUE)📊 Service Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(BLUE)📈 Resource Usage:$(NC)"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" $$(docker-compose ps -q)

##@ Utility

## install: Install/update dependencies
install:
	@echo "$(GREEN)📦 Installing dependencies...$(NC)"
	@docker-compose run --rm youtube-stats-dev sh -c "cd /app/backend && pip install -r requirements.txt"
	@docker-compose run --rm youtube-stats-dev sh -c "cd /app/frontend && yarn install"

## format: Format code
format:
	@echo "$(GREEN)✨ Formatting code...$(NC)"
	@docker-compose exec youtube-stats black /app/backend
	@docker-compose exec youtube-stats-dev yarn format

## lint: Run linters
lint:
	@echo "$(GREEN)🔍 Running linters...$(NC)"
	@docker-compose exec youtube-stats flake8 /app/backend || true
	@docker-compose exec youtube-stats-dev yarn lint || true

##@ Quick Commands

## quick-start: Quick start for development
quick-start: dev-build
	@echo "$(GREEN)✅ Development environment is ready!$(NC)"
	@echo "$(BLUE)🌐 Frontend: http://localhost:3000$(NC)"
	@echo "$(BLUE)🔧 Backend: http://localhost:8000$(NC)"
	@echo "$(BLUE)📚 API Docs: http://localhost:8000/docs$(NC)"

## deploy: Deploy to production
deploy: prod-build
	@echo "$(GREEN)✅ Production deployment complete!$(NC)"
	@echo "$(BLUE)🌐 App: http://localhost:8080$(NC)"
	@make health
