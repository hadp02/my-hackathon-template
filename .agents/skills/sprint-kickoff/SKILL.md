---
name: sprint-kickoff
description: Automates the creation and setup of the SPRINT_ACTIVE.md file for the 6-person hackathon team.
---

# Sprint Kickoff Automation

You are acting as the Sprint Assistant for a 6-person hackathon team operating on 2-3 hour "Super Short Sprints". The team Leader has invoked you to kick off a new sprint.

## Workflow Instructions

When the Leader triggers this skill (e.g. "Start a new sprint", "Run sprint kickoff"), you MUST execute the following exact steps:

1. **Read `docs/SPRINT_ACTIVE.md` (State Sync)**: If it exists, identify all tasks marked as `[x]` (completed).
2. **Update `docs/BACKLOG.md`**: Cross out (`~~task~~`) or mark `[x]` on the exact tasks in `BACKLOG.md` that were completed in the active sprint. This is critical to prevent re-assigning done tasks.
3. **Archive (Optional)**: If instructed to archive, save a copy of the old `SPRINT_ACTIVE.md` to `docs/archives/` (create if it doesn't exist) with a timestamp.
4. **Generate new `docs/SPRINT_ACTIVE.md`**: Overwrite `docs/SPRINT_ACTIVE.md` with the following template structure. You should populate the `Task 1` slots with the top highest priority tasks that are NOT completed from `BACKLOG.md`.

## Required Template for SPRINT_ACTIVE.md

```markdown
# ⚡ Active Sprint (2-3 Hours)

**Goal:** [Leader: Fill in the sprint goal here]

## 🎯 Leader Assignments

> **Rule:** Do NOT pick a task unless your name is on it. Do NOT mark a task `[x]` unless it passes CI/tests.

- `@Member1`: [ ] Task 1 (Paste from BACKLOG)
- `@Member2`: [ ] Task 1 (Paste from BACKLOG)
- `@Member3`: [ ] Task 1 (Paste from BACKLOG)
- `@Member4`: [ ] Task 1 (Paste from BACKLOG)
- `@Member5`: [ ] Task 1 (Paste from BACKLOG)
- `@Member6`: [ ] Task 1 (Paste from BACKLOG)

---

## 🌊 Overflow Queue

> **Rule:** If you finish your assigned task early, pull a task from here and append your `@Name` to it.

- [ ] Overflow Task (Paste from BACKLOG)
- [ ] Overflow Task (Paste from BACKLOG)
- [ ] Overflow Task (Paste from BACKLOG)
```

4. **Notify the Leader**: After creating the file, output a short message confirming the sprint file is ready for the 5-minute kickoff meeting. Remind the Leader to adjust the task allocations manually if the AI-selected tasks are not optimal.
