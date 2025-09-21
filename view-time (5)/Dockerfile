# Dockerfile that mirrors Databutton's Python + Node workspace
# for the YouTube analytics application

###############################
# Stage 1 - Backend dependencies
###############################
FROM python:3.11-slim AS backend-deps

ENV DEBIAN_FRONTEND=noninteractive \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update \ 
 && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        git \ 
 && rm -rf /var/lib/apt/lists/*

RUN python -m venv "$VIRTUAL_ENV"

COPY backend/requirements.txt /tmp/requirements.txt

RUN pip install --upgrade pip setuptools wheel \ 
 && pip install --no-cache-dir -r /tmp/requirements.txt

###############################
# Stage 2 - Frontend build
###############################
FROM node:18-bullseye-slim AS frontend-build

ENV NODE_ENV=production
WORKDIR /frontend

RUN apt-get update \ 
 && apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \ 
 && rm -rf /var/lib/apt/lists/*

COPY frontend/package.json frontend/yarn.lock ./

RUN corepack enable \ 
 && yarn install --immutable

COPY frontend/ ./

RUN yarn build

###############################
# Stage 3 - Runtime
###############################
FROM python:3.11-slim AS runtime

ENV DEBIAN_FRONTEND=noninteractive \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

RUN apt-get update \ 
 && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        curl \ 
 && rm -rf /var/lib/apt/lists/*

# Copy virtual environment with all Python deps
COPY --from=backend-deps $VIRTUAL_ENV $VIRTUAL_ENV

# Create application directory structure
WORKDIR /app
COPY backend/ ./backend
COPY --from=frontend-build /frontend/dist ./static

RUN mkdir -p /app/logs \
 && useradd -m -u 1000 appuser \
 && chown -R appuser:appuser /app

# Runtime configuration files
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENV PYTHONPATH=/app/backend

EXPOSE 80 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8000/health || curl -f http://127.0.0.1/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
