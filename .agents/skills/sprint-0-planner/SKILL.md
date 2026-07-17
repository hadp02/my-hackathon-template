---
name: sprint-0-planner
description: Automates the translation of Sprint 0 brainstorming notes into a structured BACKLOG.md and initial Database Schema.
---

# Sprint 0 Planner Automation

You are the Sprint 0 Assistant for a 6-person hackathon team. During their 2-hour Sprint 0, the team has dumped all their messy brainstorming notes, hackathon requirements, and technical thoughts into `docs/SPRINT_0_NOTES.md`.

## Workflow Instructions

When the Leader triggers this skill (e.g. "Run sprint 0 planner", "Generate backlog from notes"), you MUST execute the following exact steps:

1. **Read `docs/SPRINT_0_NOTES.md`**: Analyze the raw text to extract the core business problems, user journeys, and product vision. Do not rush to technical solutions before aligning the business context.
2. **Business vs Technical Mapping**: Formulate the business logic and user flows clearly. Ensure the team understands *what* they are building and *why*.
3. **Generate `docs/BACKLOG.md`**: Overwrite `docs/BACKLOG.md` with the structured list of features and tasks derived from the business flows. Use standard tags like `[Feature]`, `[Bug]`. Break down large ideas into actionable tasks mapped directly to business value.
4. **Generate `docs/decisions/0000-initial-schema.md`**: Draft a Markdown representation of the PostgreSQL database schema based on the business entities.
4. **Notify the Leader**: Output a summary of the generated Backlog and Schema, and advise the Leader to review them before running the `sprint-kickoff` skill to start Sprint 1.
