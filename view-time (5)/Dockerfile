# Multi-stage Dockerfile for YouTube Analytics App
# Based on Databutton workspace configuration

# Stage 1: Python Dependencies Builder
FROM python:3.11-slim as python-builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PDM (Python Dependency Manager)
RUN pip install pdm

# Create workspace directories
WORKDIR /workspace
RUN mkdir -p /workspace/venvs /workspace/cache

# Copy Python requirements
COPY requirements.txt .
COPY pdm_config.toml .

# Create pyproject.toml from requirements
RUN pdm import -f requirements requirements.txt

# Install dependencies with cache
RUN --mount=type=cache,target=/workspace/cache \
    pdm config cache_dir /workspace/cache && \
    pdm sync

# Stage 2: Node.js Frontend Builder  
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ .

# Build frontend
RUN npm run build

# Stage 3: Final Production Image
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -m -u 1000 appuser

# Set up directories
WORKDIR /app
RUN mkdir -p /app/logs /app/static /app/backend
RUN chown -R appuser:appuser /app

# Copy Python environment from builder
COPY --from=python-builder /workspace/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /app/static

# Copy backend code
COPY backend/ /app/backend/
RUN chown -R appuser:appuser /app

# Configure Nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Switch to app user
USER appuser

# Expose ports
EXPOSE 8000 80

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start services
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]