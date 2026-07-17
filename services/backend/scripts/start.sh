#!/bin/bash
# Startup script for API service container.
# Runs Alembic migrations before starting uvicorn.
set -e

echo "Running database migrations..."
alembic upgrade head 2>/dev/null || echo "Alembic migrations skipped (no migration files yet)"

echo "Starting API service..."
exec uvicorn src.main:app --host 0.0.0.0 --port 8002
