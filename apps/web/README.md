# Web Frontend

## Purpose
This is the unified React frontend application for the system. It is built with Vite, React, TailwindCSS, and shadcn/ui. It communicates with the backend REST API using an auto-generated OpenAPI TypeScript client.

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS, shadcn/ui
- **API Client**: @hey-api/openapi-ts (auto-generated)
- **Deployment**: Nginx (Dockerized)

## Development

### 1. Starting the Dev Server
From the repository root:
```bash
make dev-frontend
```
*Note: Vite will automatically reverse proxy `/api` requests to `http://localhost:8002` during development. You do not need to configure any API URL environment variables.*

### 2. Generating the API Client
Whenever the backend API (FastAPI) is updated, you must regenerate the TypeScript types. From the repository root:
```bash
make generate-client
```
This extracts the OpenAPI spec from the backend and generates fully-typed client endpoints in `packages/shared-types`.

### 3. Adding UI Components
We use shadcn/ui. Components are placed in `src/components/ui`.

## Deployment (Dokploy)

This application is deployed as a Dokploy Application using Nginx.
- **Build Context**: Repository Root (`.`)
- **Dockerfile Path**: `apps/web/Dockerfile`

### The Nginx Reverse Proxy
In production, the frontend does not use environment variables (like `VITE_API_URL`) to find the backend. Instead, the `nginx.conf` file contains a reverse proxy block:
```nginx
location /api/ {
    proxy_pass http://backend:8002/api/;
}
```
This ensures the built Javascript bundle is completely environment-agnostic. As long as your backend service in Dokploy is named `backend`, the proxy will securely route API requests over the internal Docker network.
