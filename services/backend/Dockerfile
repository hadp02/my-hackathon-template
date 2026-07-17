# ============================================
# Core Service — Dockerfile
# Dokploy Monorepo Deployment Config:
# 1. Build Path: /
# 2. Dockerfile Path: services/backend/Dockerfile
# 3. Docker Context Path: .
# ============================================

# Stage 1: Install dependencies
FROM python:3.12-slim AS builder
WORKDIR /app
COPY services/backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY services/backend/src/ ./src/
COPY services/backend/alembic/ ./alembic/
COPY services/backend/alembic.ini .
COPY services/backend/scripts/start.sh .
RUN chmod +x start.sh

EXPOSE 8002
CMD ["./start.sh"]
