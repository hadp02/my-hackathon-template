# Development Guide

## Project Structure

```
my-hackathon-template/
├── services/           # Backend services (Python/FastAPI)
│   └── backend/        # Core business logic, Auth, & AI agents (Agno)
├── apps/               # Frontend applications (Vite + React)
│   └── web/            # Unified frontend (Landing, Workspace, Admin)
├── packages/           # Shared code
│   ├── shared-types/   # API contracts
│   └── utils/          # Common utilities
├── docs/               # Documentation
```

## Development Workflow

### Backend Development (Python)
```bash
cd services/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run locally
export DATABASE_URL=postgresql://user:pass@dokploy-db-host:5432/devdb
uvicorn src.main:app --host 0.0.0.0 --port 8002 --reload
```

### Frontend Development (React)
```bash
cd apps/web

# Install dependencies
npm install

# Start dev server with HMR
npm run dev
```

### Database
Database runs on Dokploy as a Database Service. Schema is managed by service code (SQLAlchemy models). Connect via `DATABASE_URL` env var.

## Code Conventions

### Python (Backend)
- **Style**: PEP 8, enforced by `ruff`
- **Type hints**: Required on all public functions
- **Models**: Pydantic for validation, SQLAlchemy for ORM
- **Async**: Use `async/await` for I/O operations

### TypeScript (Frontend)
- **Style**: Oxlint + Prettier
- **Components**: Functional components with hooks
- **State**: Zustand or React Context (choose per project)

### Git Conventions
- **Branching**: `main` (production) ← `dev` (development) ← `feature/xxx`
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)

## Adding a New AI Agent

1. AI Agents are built exclusively using **Agno**.
2. Create agent file:
   - `services/backend/src/ai/agents/my_agent.py`
3. Register tools in `services/backend/src/ai/tools/`
4. Add API endpoint in the AI module
5. Tracing is automatic via the database tracker
