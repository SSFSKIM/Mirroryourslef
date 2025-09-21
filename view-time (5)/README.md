# Databutton app

This project consists of a FastAPI backend server and a React + TypeScript frontend application exported from Databutton.

## Stack

- React+Typescript frontend with `yarn` as package manager.
- Python FastAPI server with `uv` as package manager.

## Quickstart

1. Install dependencies:

```bash
make
```

2. Start the backend and frontend servers in separate terminals:

```bash
make run-backend
make run-frontend
```

## Gotchas

The backend server runs on port 8000 and the frontend development server runs on port 5173. The frontend Vite server proxies API requests to the backend on port 8000.

Visit <http://localhost:5173> to view the application.

## Docker workflows

### Production-like container

```bash
docker compose up --build
```

The image mirrors the Databutton workspace: Python 3.11 with the `backend/requirements.txt` stack and a Node 18 Vite build served through Nginx. Populate secrets in `.env.docker` (copy from `.env.docker.example`). The container exposes FastAPI on `http://localhost:8000` and the combined app via Nginx on `http://localhost:8080`.

### Hot-reload development

```bash
cp .env.development.example .env.development  # fill in optional vars
docker compose -f docker-compose.dev.yml up --build
```

The dev compose file runs the FastAPI backend with `uvicorn --reload` and a Vite dev server with hot module replacement on port `5173`, closely matching Databutton's live workspace workflow.

