# Deployment Guide — Dokploy

## Overview
Each service is deployed as a separate **Dokploy Application** using Dockerfile build mode. Database is a **Dokploy Database Service**. No docker-compose in production.

## Prerequisites
- VPS with Dokploy installed ([docs.dokploy.com](https://docs.dokploy.com))
- Domain name pointed to VPS IP
- Git repository accessible to Dokploy (GitHub/GitLab)

## Architecture on Dokploy

```
Dokploy Project: "my-app"
├── Application: backend       → services/backend/Dockerfile   → api.domain.com
├── Application: web           → apps/web/Dockerfile           → app.domain.com
└── Database: postgres         → Dokploy built-in PostgreSQL   → internal only
```

## Step-by-Step Setup

### 1. Create Project
In Dokploy UI → **Projects** → **Create Project** → Name it (e.g., "my-app")

### 2. Create Database
In the project → **Create Service** → **Database** → **PostgreSQL**
- Dokploy auto-provisions the container and volume
- Note the internal hostname (shown in Dokploy UI, e.g., `postgres-xxxx:5432`)
- Set credentials in the Database service settings
- Optionally configure automated backups via S3

### 3. Create Backend Service
1. **Create Service** → **Application**
2. **Source**: Git → Connect your repository
3. **Build Type**: Dockerfile
4. **Dockerfile Path**: `services/backend/Dockerfile`
5. **Branch**: Select your deployment branch (e.g., `main` or `dev`)
6. **Environment Variables**: Set via Dokploy UI:
   ```
   DATABASE_URL=postgresql://user:pass@postgres-xxxx:5432/appdb
   JWT_SECRET=your-production-secret
   PYTHON_ENV=production
   # ... (see .env.example for full list including AWS/MinIO and AI API Keys)
   ```
7. **Domain**: Add via Domains tab → Dokploy auto-configures Traefik + SSL

### 4. Create Web App
1. **Create Service** → **Application**
2. **Source**: Git → Same repository
3. **Build Type**: Dockerfile
4. **Dockerfile Path**: `apps/web/Dockerfile`
5. **Environment Variables** (build-time for Vite):
   ```
   VITE_API_URL=https://api.yourdomain.com
   ```
6. **Domain**: Add via Domains tab

### 5. Deploy
Click **Deploy** on each service. Dokploy will:
1. Clone your repository
2. Build the Docker image from the specified Dockerfile
3. Start the container
4. Configure Traefik routing + SSL

## Auto Deploy (CI/CD)
To enable automatic deployments when you push to GitHub:
1. Go to your application in the **Dokploy dashboard** > **General** tab and enable **Auto Deploy**.
2. Go to the **Deployments** tab and copy the **Webhook URL**.
3. In your **GitHub Repository**, go to **Settings > Webhooks > Add webhook**.
4. Paste the URL, set Content-Type to `application/json`, and choose "Just the push event".

## Branch-Based Environments

### Dev Environment
- Create each Application with **Branch**: `dev`
- Create a separate Database Service for dev
- Use different domains (e.g., `dev-api.domain.com`)
- Different env vars pointing to dev database

### Production Environment
- Same Applications but **Branch**: `main`
- Separate Database Service with production credentials
- Production domains

## Database Schema
Schema is managed by service code (SQLAlchemy models). Migrations run on application startup (via `start.sh`) automatically running `alembic upgrade head`.
