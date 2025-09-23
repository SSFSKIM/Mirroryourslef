# Full-stack Dockerfile for Cloud Run
# - Builds frontend (Vite) and serves via Nginx on $PORT (default 8080)
# - Runs backend (FastAPI) via Uvicorn on 8000, proxied at /routes/**

###############################
# Stage 1 - Backend dependencies
###############################
FROM python:3.11-slim AS backend-deps

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      build-essential \
      curl \
      git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend
COPY backend/requirements.txt ./requirements.txt

RUN python -m venv "$VIRTUAL_ENV" \
 && python -m pip install --upgrade pip setuptools wheel \
 && python -m pip install -r requirements.txt

###############################
# Stage 2 - Frontend build
###############################
FROM node:18-bullseye-slim AS frontend-build

ENV NODE_ENV=production
WORKDIR /app/frontend

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      python3 \
      make \
      g++ \
 && rm -rf /var/lib/apt/lists/*

COPY frontend/package.json frontend/yarn.lock ./
RUN corepack enable && yarn install --immutable
COPY frontend/ ./
# Ensure API_PREFIX_PATH defaults to /routes at build time
ENV API_PREFIX_PATH=/routes
RUN yarn build

###############################
# Stage 3 - Runtime
###############################
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8080

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      nginx \
      supervisor \
      curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python environment and app code
COPY --from=backend-deps $VIRTUAL_ENV $VIRTUAL_ENV
COPY backend/ ./backend

# Copy built frontend assets
COPY --from=frontend-build /app/frontend/dist ./static

# Add runtime configs
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /app/logs \
 && useradd -m -u 1000 appuser \
 && chown -R appuser:appuser /app

EXPOSE 8080 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT}/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

