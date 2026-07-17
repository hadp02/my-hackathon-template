# My Hackathon Template 🚀

A full-stack, "Plug and Play" starter kit designed for Hackathons, MVP building, and personal projects. Optimized for speed, reliability, and easy deployment via Dokploy using a Modular Monolith architecture.

## 🤖 AI ONBOARDING (READ FIRST)
> Dành cho tất cả thành viên khi mới clone dự án về máy:
Để tự động thiết lập môi trường cá nhân và bắt đầu Sprint 0, hãy copy câu lệnh dưới đây và chat với AI Coding Agent của bạn:
`"Hãy bắt đầu Sprint 0"`

---
## ⚠️ Hackathon Template Disclosure

**Attention Judges / Reviewers:**
This repository uses our team's standard pre-built boilerplate (`my-hackathon-template`). To comply with hackathon rules regarding pre-existing code, please note the following:

- **Pre-built Boilerplate:** The authentication flow (JWT + Passlib), basic database routing (FastAPI + SQLAlchemy base configs), and foundational frontend setup (Vite + React + Tailwind setup) are part of this template.
- **Hackathon Code:** All specific business logic, AI agent workflows, feature-specific API endpoints, and new frontend components/pages were built entirely during the hackathon. 

*We commit to maintaining a clear git history during the event so judges can easily verify the code written during the hackathon period.*

---

## 🏗 Architecture Overview

This template uses a Modular Monolith structure to simplify development and deployment while retaining the ability to scale.

- **Frontend (`apps/`)**:
  - `apps/web`: Main frontend application (Vite + React + Tailwind + shadcn/ui). Includes routing for Landing Page, Workspace Dashboard, and Admin Dashboard.
- **Backend (`services/`)**:
  - `services/backend`: Main backend API (FastAPI + SQLAlchemy + PostgreSQL). Includes Rate Limiting (SlowAPI), robust Auth (JWT + Passlib), and integrated AI capabilities (Agno, RAG, OpenAI/Anthropic/Gemini).
- **Shared (`packages/`)**:
  - `packages/shared-types`: Shared TypeScript definitions between frontend and backend.

## ✨ Key Features

- **Multi-Agent AI**: Built-in support for single agents, RAG agents, and multi-agent teams directly within the backend.
- **Security First**: Global rate limiting, explicit CORS, Pydantic settings management.
- **Dokploy Ready**: The backend and web app have their own `Dockerfile` with multi-stage builds. No `docker-compose` needed in production.
- **Developer Experience**:
  - `make` commands for everything (Windows users must use Git Bash/WSL).
  - Pre-configured `pytest`, `ruff`, `oxlint`.
- **Hackathon-Ready Core Services**:
  - **S3/MinIO File Uploads**: Pre-configured `boto3` client to handle file uploads via `POST /api/v1/upload/`.
  - **Background Tasks**: Native FastAPI BackgroundTasks endpoint to run long-running AI tasks without blocking (`POST /api/v1/tasks/run`).
  - **WebSockets**: Pre-built backend WebSocket router (`/api/v1/ws/chat`) and a frontend `useWebSocket.ts` hook for realtime streaming.
  - **Dashboard Layout**: A ready-to-use Shadcn `DashboardLayout` for the frontend.

## 🚀 Quickstart

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker & Docker Compose
- Make

### 1. Initial Setup
Run the setup command to install all npm and pip dependencies across the workspace:
```bash
make setup
```

### 2. Environment Variables
Copy the `.env.example` to `.env` in the root and in the respective services:
```bash
cp .env.example .env
cp services/backend/.env.example services/backend/.env
```

### 3. Generate API Client (SDK)
Whenever you modify the backend API, the frontend Typescript SDK must be regenerated.
To automate this during development, run the watcher in a separate terminal:
```bash
make watch-client
```
*(You can also run `make generate-client` manually if needed).*

### 4. Start Development Servers
You can start everything (Frontend, Backend, Postgres DB) with a single command:
```bash
make dev
```
*(Alternatively, run `make dev-backend` or `make dev-frontend` to start them separately).*

### 5. Database Migrations
The database is managed by Alembic. To create a new migration after modifying models:
```bash
make migrate-new m="add_users_table"
```
To apply migrations:
```bash
make migrate
```

> **⚠️ Team Workflow & Alembic Conflicts:**
> With multiple people generating migrations simultaneously, you will encounter `Multiple Head Revisions` errors. 
> **Rule:** We use a single Remote Database for development. Before running `make migrate-new`, you MUST run `git pull` to fetch the latest migration files from your teammates to prevent conflicts.

### 6. Windows Users Guide
> **⚠️ Important:** The `Makefile` relies on Unix commands like `lsof` and background processes (`&`). 
> **You MUST use Git Bash or WSL (Windows Subsystem for Linux)** to run `make dev`, `make stop`, and other commands successfully on Windows. Native Command Prompt or PowerShell will fail.

## 🚢 Deployment (Dokploy)

> **⚠️ Hardware Requirements:**
> Do not deploy this on a cheap VPS (e.g., 1GB - 2GB RAM). Running the Vite build process alongside FastAPI and PostgreSQL will cause an Out-Of-Memory (OOM) crash.
> **You MUST rent a VPS with at least 4GB of RAM** to ensure smooth deployments during the Hackathon.

This repository is designed for Dokploy's **Application Mode**.
1. Create a new Application in Dokploy for each service (e.g., Backend, Web).
2. Point the Build path to the repo root (`.`) for ALL services (both Web and Backend).
3. Set the Dockerfile path (`./apps/web/Dockerfile` or `./services/backend/Dockerfile`).
4. Set Environment Variables in the Dokploy UI.
5. Deploy!

### ⚡ Auto Deploy (CI/CD)
To enable automatic deployments when you push to GitHub:
1. Go to your application in the **Dokploy dashboard** > **General** tab and enable **Auto Deploy**.
2. Go to the **Deployments** tab and copy the **Webhook URL**.
3. In your **GitHub Repository**, go to **Settings > Webhooks > Add webhook**.
4. Paste the URL, set Content-Type to `application/json`, and choose "Just the push event".
*(Note: We use this native Dokploy webhook instead of GitHub Actions for simplicity during the hackathon).*

## 📚 Documentation Layout

This repository separates documentation to prevent information overload for human developers, while keeping AI agents strictly controlled.

### 👤 For Human Developers
**This `README.md` is the only onboarding document you need.** It contains all instructions to install, run, and deploy the template.
- `docs/ARCHITECTURE.md`: Read this to understand the Application structure (React, FastAPI, DB).

### 🤝 Shared (Human & AI)
Documents that define the system truth.
- `docs/product/` & `docs/stories/`: Feature requirements and tickets.
- `docs/decisions/`: Architecture Decision Records (ADRs).
- `docs/openapi/`, `docs/TEST_MATRIX.md`, `docs/TOOL_REGISTRY.md`

### 🤖 For AI Agents ONLY (Harness Control Layer)
> **WARNING:** If you are a human developer, **DO NOT** read these. They are strict operating manuals for AI Coding Agents.
- `docs/HARNESS*.md`, `docs/CONTEXT_RULES.md`, `docs/TRACE_SPEC.md`, `docs/IMPROVEMENT_PROTOCOL.md`
- `docs/onboarding/`: AI-specific environment setup and tool creation guides.
