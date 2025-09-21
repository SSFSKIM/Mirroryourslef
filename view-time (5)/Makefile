install-backend:
	chmod +x backend/install.sh
	chmod +x backend/run.sh
	cd backend && ./install.sh

install-frontend:
	chmod +x frontend/install.sh
	chmod +x frontend/run.sh
	cd frontend && ./install.sh

install: install-backend install-frontend

run-backend:
	cd backend && ./run.sh

run-frontend:
	cd frontend && ./run.sh

dev:
	docker compose -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

.DEFAULT_GOAL := install
