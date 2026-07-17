# System Architecture

> **Note:** This document describes the software architecture of the Application (Frontend, Backend). For AI Agent workflow orchestration and rules, see [HARNESS.md](./HARNESS.md).

## System Overview

Monorepo deployed as individual Dokploy Applications using a **Modular Monolith** architecture. Each main application has its own Dockerfile, environment, and domain. Database is a Dokploy-managed PostgreSQL service.

```text
                    ┌──────────────────────────────────────────────────┐
                    │                   CLIENTS                        │
                    │                 ┌─────────────┐                  │
                    │                 │  apps/web   │                  │
                    │                 │(Vite+React) │                  │
                    │                 │  app.dom    │                  │
                    │                 └──────┬──────┘                  │
                    └────────────────────────┼─────────────────────────┘
                                             │          REST API
                    ┌────────────────────────▼─────────────────────────┐
                    │         DOKPLOY (Application Mode)               │
                    │                                                  │
                    │                 ┌──────────────┐                 │
                    │                 │   backend    │                 │
                    │                 │   api.dom    │                 │
                    │                 └──────┬───────┘                 │
                    │                        │                         │
                    │  ┌─────────────────────▼───────────────────────┐ │
                    │  │              Dokploy Database               │ │
                    │  │      Postgres (App Data & AI traces)        │ │
                    │  └─────────────────────────────────────────────┘ │
                    │                                                  │
                    │  Traefik (auto SSL) ← Managed by Dokploy        │
                    └──────────────────────────────────────────────────┘
```

## Deployment Model

Each component is a **separate Dokploy Application**:

| Service | Dockerfile Path | Build Context | Type | Exposed Via |
|---------|----------------|---------------|------|-------------|
| backend | `services/backend/Dockerfile` | **Repo root** (`./`) | Dokploy Application | Traefik (auto) |
| web | `apps/web/Dockerfile` | **Repo root** (`./`) | Dokploy Application | Traefik (auto) |
| postgres | — | — | Dokploy Database Service | Internal only |

> **Note:** Frontend app uses repo root as build context because it depends on `packages/shared-types/` and `packages/utils/`. In Dokploy UI, set Build Context = `.` and Dockerfile Path = `apps/web/Dockerfile`.

## Module & Service Map

| Module | Path | Purpose | Stack |
|--------|------|---------|-------|
| Backend Service | `services/backend/` | Core business logic, Auth, user management, and AI Agents | Python, FastAPI, Agno |
| Web App | `apps/web/` | Unified frontend (Landing, Workspace, Admin) | Vite, React, TypeScript |
| Shared Types | `packages/shared-types/` | Auto-generated API client & Types from Backend | TypeScript, openapi-ts |
| Utilities | `packages/utils/` | Common helpers | TypeScript, Python |
| AI Tracing | `services/backend/src/ai/core/tracing/` | Agent observability | Postgres, Custom |

## Data Flow

### Frontend API SDK Generation
```text
Backend FastAPI (OpenAPI JSON) → export_openapi.py → docs/openapi/api-spec.json
api-spec.json → openapi-ts (npm run generate:api) → packages/shared-types/src (TypeScript Client)
apps/web → imports @app/shared-types → Type-safe API calls
```

### Authentication Flow
```text
Client → Backend Service → Dokploy PostgreSQL → JWT Token → Client
Client → Backend Service → Validate JWT → Process Request
```

### AI Agent Flow
```text
Client → Backend Service → Agent Router → LLM Provider (OpenAI/Anthropic/Gemini)
                                        → Postgres Trace Log
                                        → Response → Client
```

### Realtime & Background Task Flow
```text
Client (ws://) → Backend WebSocket (ws.py) → Broadcast / AI Streaming → Client
Client (HTTP) → Backend Task (tasks.py) → BackgroundTasks (FastAPI) → Return 202 Accepted
```

### File Upload Flow (S3/MinIO)
```text
Client → Backend (upload.py) → Threadpool (boto3) → MinIO/S3 Bucket → Returns File URL
```

## Branch Strategy
- `dev` branch → Dokploy dev Applications + dev Database
- `main` branch → Dokploy production Applications + production Database

---

## Default Layering (Backend Services)

For Python backend services (FastAPI), we use a pragmatic, simplified CRUD structure designed for speed and rapid iteration (MVP/Hackathon style).

```text
src/
  ├── ai/          # AI Agents, Tools, and Workflows (Agno)
  ├── api/         # FastAPI Routers & Endpoints
  ├── core/        # Configuration, DB sessions, Security dependencies
  ├── models/      # SQLAlchemy ORM Models
  ├── schemas/     # Pydantic validation schemas
  └── services/    # (Optional) Business logic if not placed directly in API
```

### Design Principles

- **Pragmatism over Purity:** Handlers in the `api` layer are allowed to directly call the database using `CRUDService` to minimize boilerplate.
- **Pydantic Everywhere:** Validate all incoming requests and outgoing responses using Pydantic schemas.
- **Modular AI:** AI agents live inside the backend service (`src/ai`) directly processing requests without needing internal proxy hops.

## Parse-First Boundary Rule

Unknown data must be parsed at boundaries before it enters inner code.

Boundaries include:
- HTTP request bodies, params, and query strings.
- Environment variables.

Target flow:
```text
unknown input
  -> parser (e.g., Pydantic)
  -> typed DTO or command
  -> application use case
  -> domain object/value object
```

Inner layers should work with meaningful product types such as `UserId`, `AccountId`, `Role`, rather than repeatedly validating raw strings.

## Command/Query Boundary

If the product has both reads and writes, keep command/query separation clear at the code level even when the storage layer is simple:
- Commands mutate state and own audit side effects.
- Queries read state and format for consumers.
- Shared domain rules live in domain/application, not controllers.

## Observability Contract

The future server should emit one canonical JSON log line per request with:
- timestamp
- level
- request_id
- user_id when known
- action
- duration_ms
- status_code
- message

Audit logs are product records. Application logs are operational records. Do not use one as a substitute for the other.
