# Minimal backend-only Dockerfile for Google Cloud Run
# - Serves FastAPI via Uvicorn on $PORT (Cloud Run default 8080)
# - Builds from backend/ only (no frontend assets)

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

# System deps (curl for healthchecks/logging; build-essential if wheels are missing)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      curl \
      build-essential \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (leverage Docker layer cache)
COPY requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel \
 && python -m pip install -r requirements.txt

# Copy backend application code
COPY . .

# Cloud Run sends traffic to $PORT (default 8080)
EXPOSE 8080

# Healthcheck (optional locally; Cloud Run uses request-based checks if configured)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -f http://127.0.0.1:${PORT}/health || exit 1

# Start FastAPI via uvicorn; routers.json is read from CWD
CMD ["bash", "-lc", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]

