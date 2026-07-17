# Backend Service (Modular Monolith)

## Purpose
The Backend Service manages the central business logic, API routing, Authentication, and AI Agent workflows. This is a **Modular Monolith** built on FastAPI, meaning all domains and logic reside in this single deployable service, organized into logical layers.

## Tech Stack
* Python 3.12+
* FastAPI
* PostgreSQL (via SQLAlchemy + asyncpg + psycopg2)
* Agno (for AI Agents)
* Pydantic (for request/response validation)

## Architecture

The service is organized into a clean folder structure (`src/`):

```
src/
  ├── ai/          # AI Agents, Tools, Memory, and Workflows (Agno)
  ├── api/         # FastAPI Routers & Endpoints
  ├── core/        # Configuration, Dependency Injection, Security
  ├── models/      # SQLAlchemy ORM Models
  ├── schemas/     # Pydantic validation schemas
  └── services/    # (Optional) Complex business logic
```

### Data Flow
All incoming requests pass through FastAPI routes (`api/`), where data is validated via Pydantic (`schemas/`). Handlers then interact with the database (`models/`) or dispatch complex logic to AI Agents (`ai/`).

All AI Agent Memory and Tracing is natively persisted to **PostgreSQL**.

## Development

### 1. Database Migrations (Alembic)
The database is managed by Alembic. 
- To apply migrations: `make migrate`
- To generate a new migration: `make migrate-new m="message"`

> **Note**: Do NOT manually create tables. Always use `make migrate-new`. If you want to seed data for testing, run `make seed` (which automatically runs migrations first).

### 2. Environment Variables
Configure the service using these environment variables (defined in `.env` or Dokploy UI):

```env
# Server config
PORT=8002
ENVIRONMENT=local

# Database config
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/core_db
SYNC_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/core_db
```

### 3. Background Tasks & Workers
Long-running AI jobs and evaluations are handled via native FastAPI BackgroundTasks, or the standalone `worker.py` entrypoint.

## Deployment (Dokploy)
This service is deployed as a single Dokploy Application.
- **Build Context**: Repository Root (`.`)
- **Dockerfile Path**: `services/backend/Dockerfile`
- **Internal Hostname**: `backend` (Ensure this matches in Dokploy so the frontend Nginx reverse proxy works properly).
