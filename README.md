<div align="center">

# My Hackathon Template 🚀

**A full-stack, "Plug and Play" starter kit for Hackathons, MVPs, and rapid prototyping.**

[![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

[Architecture](docs/ARCHITECTURE.md) · [Dokploy Setup](docs/DOKPLOY_STAGING_SETUP.md)

</div>

---

This template uses a Modular Monolith architecture to simplify development and deployment while retaining the ability to scale. It eliminates the boilerplate of setting up authentication, databases, routing, and deployment pipelines so you can focus strictly on business logic during a hackathon.

## 🎯 Pain Points & Solutions

| Vấn đề khi setup dự án mới | Giải pháp từ Template |
|---|---|
| Tốn hàng giờ cấu hình Auth, DB, CORS | **Sẵn sàng 100%:** JWT Auth, FastAPI, SQLAlchemy, Alembic đã được wire sẵn. |
| Code Frontend và Backend bị lệch type | Sử dụng `openapi-ts` để tự động gen TypeScript SDK. Đảm bảo **End-to-End Type Safety**. |
| Quên khóa API trên public repo | Tích hợp sẵn `scripts/check_secrets.py` chạy tự động khi `make lint`. |
| Conflict Database khi dev team lớn | Quy trình quản lý DB Migration rõ ràng qua `TEAM_WORKFLOW.md`. |
| Deploy cực khổ, cài cắm Docker Compose | Hỗ trợ 100% **Dokploy Application Mode** (không cần docker-compose). |

## ✨ Key Features

- **Multi-Agent AI Ready**: Built-in support for single agents, RAG agents, and multi-agent teams using `agno` directly within the backend.
- **Security First**: Global rate limiting (SlowAPI), explicit CORS, and secret scanning.
- **Developer Experience (DX)**:
  - 1-click `make` commands for everything.
  - Pre-configured `pytest`, `ruff` (Python), and `oxlint` (Frontend).
- **Core Services Included**:
  - **File Uploads**: Pre-configured `boto3` for S3/MinIO.
  - **Background Tasks**: Native FastAPI endpoint for long-running AI tasks.
  - **WebSockets**: Pre-built router and `useWebSocket.ts` hook for realtime streaming.

## 🏗 Kiến Trúc

**Modular Monolith** — 2 service deploy riêng qua Dokploy.

```
personal-template
├── apps/web/                  # Frontend: Vite + React + TailwindCSS + shadcn/ui
│
├── services/backend/          # Backend: FastAPI + SQLAlchemy + Agno
│   ├── src/api/               # REST API routers
│   ├── src/core/              # Security, configs, DB session
│   ├── src/models/            # SQLAlchemy models
│   └── src/schemas/           # Pydantic validation schemas
│
├── packages/shared-types/     # Auto-generated TypeScript types (OpenAPI → TS)
└── docs/                      # Tài liệu quy trình & kiến trúc
```

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, shadcn/ui |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| AI/ML | Agno (agent framework), OpenAI/Anthropic SDKs |
| Database | PostgreSQL 16 (Dokploy managed) |
| Deploy | Dokploy Application Mode, Nginx |

## 🚀 Quick Start

```bash
# 1. Install all dependencies (npm install at root, pip install for backend)
make setup

# 2. Configure Environment Variables
cp .env.example .env
cp services/backend/.env.example services/backend/.env

# 3. Start dev servers
make dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:8002
# API docs → http://localhost:8002/docs

# 4. Database Migrations
make migrate              # Run migrations
make migrate-new m="msg"  # Create new migration (Read TEAM_WORKFLOW.md first!)

# 5. API client (auto-gen TypeScript types)
make generate-client      # One-shot generate
make watch-client         # Watch mode
```

> ⚠️ **Windows Users:** `Makefile` sử dụng Unix commands. Bạn BẮT BUỘC phải dùng **Git Bash** hoặc **WSL**. PowerShell/CMD sẽ gây lỗi.

## 🚢 Deployment

Deploy qua **Dokploy Application Mode** — mỗi service là 1 Dokploy Application riêng:

| Service | Dockerfile | Port |
|---|---|---|
| Backend | `services/backend/Dockerfile` | 8002 |
| Frontend | `apps/web/Dockerfile` | 80 (Nginx) |
| Database | Dokploy PostgreSQL Service | 5432 |

Chi tiết xem tại: [`docs/DOKPLOY_STAGING_SETUP.md`](docs/DOKPLOY_STAGING_SETUP.md)

## 📚 Documentation Layout

Tài liệu được phân tách rõ ràng để hỗ trợ cả **Người (Human)** và **Máy (AI Agent)** đọc, định vị ngữ cảnh nhanh nhất.

### Architecture & Infrastructure

| Tài liệu | Mô tả |
|---|---|
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Kiến trúc tổng quan (React, FastAPI, Database schema). |
| [`DOKPLOY_STAGING_SETUP.md`](docs/DOKPLOY_STAGING_SETUP.md) | Hướng dẫn Deploy lên VPS bằng Dokploy. |

### Team & Workflow

| Tài liệu | Mô tả |
|---|---|
| [`TEAM_WORKFLOW.md`](docs/TEAM_WORKFLOW.md) | Luồng phối hợp nhóm (Sprint process, Database rules, API mock). |
| [`SPRINT_ACTIVE.md`](docs/SPRINT_ACTIVE.md) | Bảng Kanban hiện tại của team, chứa các Abstract Guidelines. |

## 🤖 AI Agent Onboarding

Nếu bạn đang sử dụng AI Coding Agent (ví dụ: Antigravity/Cursor/Claude), file `README.md` này cung cấp toàn bộ ngữ cảnh về stack. Hãy yêu cầu AI đọc `TEAM_WORKFLOW.md` và `SPRINT_ACTIVE.md` để hiểu luật phối hợp (như không tự ý gen DB migration) trước khi bắt đầu code!

## 📄 License

MIT
