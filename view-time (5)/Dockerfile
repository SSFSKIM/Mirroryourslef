# Multi-stage build for YouTube Stats App
FROM ubuntu:22.04 AS frontend-builder

WORKDIR /app/frontend

# Install Node.js and Yarn
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g yarn \
    && rm -rf /var/lib/apt/lists/*

# Copy all frontend files at once (includes Yarn PnP files)
COPY frontend/ ./
RUN corepack enable && yarn install --immutable && yarn build

# Python backend stage
FROM ubuntu:22.04 AS backend-base

# Install system dependencies and Python
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && ln -sf /usr/bin/pip3 /usr/bin/pip

WORKDIR /app/backend

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Final production stage
FROM ubuntu:22.04 AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    python3 \
    python3-pip \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && ln -sf /usr/bin/pip3 /usr/bin/pip

WORKDIR /app

# Copy Python dependencies from backend-base
COPY --from=backend-base /usr/local/lib/python3.10/dist-packages /usr/local/lib/python3.10/dist-packages
COPY --from=backend-base /usr/local/bin /usr/local/bin

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy backend source
COPY --from=backend-base /app/backend /app/backend

# Nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Environment variables
ENV PYTHONPATH=/app/backend
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD []
