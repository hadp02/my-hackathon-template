# 0001: Use Dokploy Application Mode

- **Date:** 2026-07-08
- **Status:** Accepted

## Context

We need a deployment strategy for a monorepo containing multiple independent services (FastAPI backends, React frontends) that allows flexible scaling, domain mapping, and isolation without the complexity of managing a large Kubernetes cluster or the strictness of a single Docker Compose file.

## Decision

We will use **Dokploy Application Mode** for each service.
Each service will have its own `Dockerfile`. 
The database will be managed via **Dokploy Database Service** (PostgreSQL).
Traefik (managed by Dokploy) will handle SSL and routing.

## Consequences

- **Pros:** Isolation of services, easy to assign subdomains, built-in Traefik routing, easy UI management.
- **Cons:** Requires a VPS with Dokploy installed. Local development requires running multiple services independently.
