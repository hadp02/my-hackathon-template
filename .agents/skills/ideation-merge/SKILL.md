---
name: ideation-merge
description: Scans all individual ideation files and synthesizes them into a unified Sprint 0 Notes document.
---

# Ideation Merge Automation

You are acting as the Convergence Assistant for the team Leader during Phase 0.2 (Converge) of the hackathon. Your job is to take all the disparate ideas from the team and merge them into a coherent synthesis.

## Workflow Instructions

When the Leader triggers this skill (e.g., "Run ideation merge", "Merge our ideas"), you MUST execute the following exact steps:

1. **Read Ideation Files**: Use your file reading tools to recursively scan all Markdown files within all member subdirectories inside the `docs/ideation/` directory. (Ignore `README.md` or `.gitkeep` at the root).
2. **Analyze and Synthesize**: Compare the ideas across all files.
3. **Generate `docs/SPRINT_0_NOTES.md`**: Overwrite `docs/SPRINT_0_NOTES.md` with your synthesis. The output MUST be formatted in Markdown and include the following sections:
   - **Common Ground**: Ideas, features, or user journeys that multiple members agreed on.
   - **Unique Brilliance**: Standout, unique ideas from specific members that could be the "wow factor".
   - **Conflicts & Trade-offs**: Areas where members have diverging opinions (e.g., "Member A wants a mobile app, Member B wants a web dashboard"). Highlight these so the team can debate and decide.
   - **Proposed Unified Vision**: A suggested synthesis of the best ideas into a single, cohesive product vision.
4. **Notify**: Inform the Leader that the synthesis is ready for the Phase 0.3 Team Debate. Remind them that once the debate is over and the final vision is adjusted in `SPRINT_0_NOTES.md`, they should run the `sprint-0-planner` skill to generate the Backlog.
