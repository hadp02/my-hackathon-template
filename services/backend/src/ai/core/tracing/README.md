# AI Tracing — Postgres Database

## Purpose
Self-hosted AI agent tracing system using PostgreSQL (via `PostgresDb` provided by Agno). No external SaaS dependency (no Langfuse, no LangSmith). Full ownership of trace data.

## Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   AI Service    │────▶│  PostgresDb      │────▶│ Dokploy DB     │
│  (Agno)         │     │  (Agent Sessions)│     │ core_db        │
└─────────────────┘     └──────────────────┘     └────────┬───────┘
                                                          │
                                                 ┌────────▼───────┐
                                                 │ Admin Dashboard│
                                                 │ (read traces)  │
                                                 └────────────────┘
```

## Storage
- **Volume**: Managed entirely by Dokploy's PostgreSQL instance.
- **Database**: The primary application database (`core_db`).
- **Tables**: Agno automatically creates and manages tables for session and trace data (e.g. `agent_sessions`).

## Integration Pattern
The tracing logic natively hooks into Agno's `Agent` class via the `storage` parameter.

```python
from agno.agent import Agent
from agno.storage.agent.postgres import PostgresAgentStorage

# Instantiate global storage (points to core database)
storage = PostgresAgentStorage(
    db_url=settings.SYNC_DATABASE_URL,
    table_name="agent_sessions"
)

# Attach to agent
my_agent = Agent(
    storage=storage,
    add_history_to_messages=True
)
```

## Querying Traces
The Admin Dashboard reads traces via REST API endpoints in the AI service, filtering the `agent_sessions` table based on user/session IDs.
