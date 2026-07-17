# How to Use This Template

Step-by-step guide for starting a new project from this template. This template is designed to be "Plug and Play" with automated setup scripts.

## 1. Fork / Clone

```bash
# Option A: GitHub template
# Click "Use this template" on GitHub

# Option B: Manual clone
git clone https://github.com/youruser/my-hackathon-template.git my-project
cd my-project
rm -rf .git && git init
```

## 2. Setup Environment

We use a unified `Makefile` to orchestrate everything (database, APIs, and frontends). Note: Windows users must use Git Bash or WSL.

```bash
# 1. Copy env templates and configure them
make setup

# 2. Open services/backend/.env and customize:
# - JWT_SECRET (generate: openssl rand -base64 32)
# - API keys (OpenAI, AWS/MinIO, etc.) if needed
```

## 3. Run Development Server

```bash
make dev
```
That's it! `make dev` will automatically:
- Start the PostgreSQL database via `docker-compose.dev.yml`.
- Install dependencies for all services and apps (`pip` and `npm`).
- Run database migrations (`alembic`).
- Start the Backend Service (port 8002) which includes AI agents, WebSockets, and BackgroundTasks.
- Start the unified Web App (Vite) that includes Workspace, Admin, and Landing views.

## 4. Customize for Your Project

### Rename the project
- Update `apps/web/package.json` → `name`
- Update `services/backend/src/core/config.py` → `PROJECT_NAME`
- Update `README.md`

### Add your first business model
See [07_ADDING_A_RESOURCE.md](07_ADDING_A_RESOURCE.md).

### Deploy to Dokploy
See [03_DEPLOYMENT.md](03_DEPLOYMENT.md).

## Checklist

- [ ] Fork/clone template
- [ ] Run `make setup` and configure `.env`
- [ ] Run `make dev`
- [ ] Add first business model
- [ ] Customize frontend branding
- [ ] Configure Dokploy Auto Deploy via Webhook
- [ ] Deploy to Dokploy
