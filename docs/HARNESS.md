# Harness Workflow

Welcome to the hackathon harness. This repository is configured to move extremely fast while keeping our **6-person team and our AI Coding Agents tightly aligned**. 

We achieve this by treating AI agents as team members, and ensuring both humans and agents follow the exact same markdown-based workflow.

## Team Collaboration Model
1. **Humans own Strategy & Review**: The human team defines product features, architecture changes, and prioritizes tasks.
2. **Humans & Agents execute**: Both human developers and AI agents write code. Agents act as "super-assistants" working on the shared branch alongside humans.
3. **Validation is the Gate**: Neither a human nor an agent can declare a task "Done" without passing the validation requirements.

## Core Documentation

### 1. Quản lý Task & Sprints (Product vs Sprint Backlog)
- **Product Backlog (`docs/BACKLOG.md`)**: Là nơi chứa mọi Idea, Feature, và Bug chưa làm.
- **Active Sprint (`docs/SPRINT_ACTIVE.md`)**: Là Single Source of Truth cho công việc trong 2-3 giờ tới. Mọi task sẽ được assign rõ ràng cho Human hoặc AI Agent hoặc vứt vào Overflow Queue.
- **Rule**: Để tránh Git Merge Conflict, Human và Agent chỉ đánh dấu tiến độ `[/]` và `[x]` vào file `SPRINT_ACTIVE.md` trong suốt Sprint. Khi gọi AI tạo Sprint mới, AI sẽ tự động đồng bộ các task đã `[x]` ngược về `BACKLOG.md`.

### 2. The Rulebook (`docs/ARCHITECTURE.md`)
The structural rules, tech stack (Vite + FastAPI + PostgreSQL), and constraints (Modular Monolith) for the project.
- **Everyone**: Read this before adding new API endpoints, modifying boundaries, or setting up integrations.

### 3. Execution Standard (`docs/TEAM_WORKFLOW.md`)
To prevent collisions, merge conflicts, and context overload, the whole team must follow strict execution phases (Intake, Plan, Implement, Validate, Handoff).
- **Everyone**: This is your operational manual. Follow it for every task to ensure smooth teamwork.

### 4. Historical Context (`docs/decisions/`)
Major architectural choices are logged here.
- **Rule**: If you make a significant structural change, copy `0000-template.md` to a new file (e.g., `0001-auth-system.md`) and document the decision for the rest of the team.

## Immutable Rules for AI Agents
- **English Only**: Respond in terse, clear English without conversational filler. Start at the answer.
- **Sprint 0 Ideation Mode**: If the user is in Sprint 0, DO NOT write technical code. Your job is to act as a product brainstormer. Follow the 4-step Diverge/Converge process defined in `docs/TEAM_WORKFLOW.md`. Use the `ideation-assistant` skill when asked to help brainstorm.
- **No Legacy CLI**: Do NOT attempt to run `harness-cli` commands. The old tracking system is removed.
- **Validation is a Gate**: Treat your output like a Pull Request. Always run tests (`make test`) and linting (`make lint`) before ending your turn.
- **Agent Handoff**: When finishing a task, you MUST generate a `docs/stories/<task-name>.md` Story Packet if the changes were complex. This provides the human developer with the full architectural context needed to understand the code you pushed to `main`/`dev`.
