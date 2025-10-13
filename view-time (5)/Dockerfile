# syntax=docker/dockerfile:1.6

##############################
# Frontend build stage
##############################
FROM node:20-bullseye AS frontend-builder
WORKDIR /app/frontend

COPY frontend/ ./

# Ensure Yarn 4 is available and install dependencies
RUN corepack enable \
    && corepack prepare yarn@4.10.2 --activate \
    && yarn install --immutable

ENV NODE_ENV=production
RUN yarn build

##############################
# Production runtime image
##############################
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/usr/local/bin:${PATH}"

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        nginx \
        supervisor \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ /app/backend/
RUN find /app/backend -name "__pycache__" -type d -prune -exec rm -rf {} +

COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/* && mkdir -p /usr/share/nginx/html
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN mkdir -p /var/log/supervisor

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://127.0.0.1/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
