# Quick Start Guide

Get deployed in under 10 minutes via Dokploy.

## Prerequisites
- **VPS** with [Dokploy](https://docs.dokploy.com) installed
- **Domain** pointed to your VPS IP
- **Git repo** accessible to Dokploy (GitHub/GitLab/Bitbucket)

## Setup

### 1. Create Dokploy Project
In Dokploy dashboard → **Create Project** → Name it (e.g., "my-hackathon-app")

### 2. Create Database
**Create Service** → **Database** → **PostgreSQL**
- Note the internal hostname from Dokploy UI (e.g., `postgres-xxxx:5432`)
- Schema is managed by service code (SQLAlchemy models) using Alembic migrations.

### 3. Deploy Backend Service
The backend service handles the REST APIs, AI agent logic, WebSockets, Background Tasks, and JWT Authentication.
1. **Create Service** → **Application** → Git → This repo
2. Set **Dockerfile Path**: `services/backend/Dockerfile`
3. Set **Branch**: `main` (or `dev`)
4. Set **Env Vars** (see `.env.example`). At a minimum:
   - `DATABASE_URL=postgresql://user:pass@postgres-xxxx:5432/db`
   - `JWT_SECRET=your-secure-random-string`
5. Add **Domain** → auto SSL
6. **Deploy**

### 4. Deploy Web App
The web application includes the landing page, user workspace, and admin dashboard all in a single Vite app.
1. **Create Service** → **Application** → Git → This repo
2. Set **Dockerfile Path**: `apps/web/Dockerfile`
3. Set build-time env: `VITE_API_URL=https://your-backend-domain.com`
4. Add **Domain** → auto SSL
5. **Deploy**

### 5. Verify
Check each service in Dokploy dashboard:
- ✅ Status: Running
- ✅ Logs: No errors
- ✅ Domain: Accessible via HTTPS

## Next Steps
- Read [Architecture Guide](../ARCHITECTURE.md) for system design
- Read [Development Guide](./02_DEVELOPMENT.md) for dev workflow
- Read [Deployment Guide](./03_DEPLOYMENT.md) for production setup
