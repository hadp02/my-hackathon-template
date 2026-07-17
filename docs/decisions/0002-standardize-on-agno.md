# 0002: Standardize AI Framework on Agno

- **Date:** 2026-07-10
- **Status:** Accepted (Supersedes 0002-dual-ai-framework-agno-langgraph.md)

## Context

Previously, the project considered using a dual-framework approach (Agno for simple tools, LangGraph for complex workflows). However, introducing multiple frameworks increases cognitive load, complicates tracing, and goes against the goal of keeping the architecture simple and streamlined.

## Decision

We will standardize **100% on Agno** for all AI Agents, from simple RAG to complex Multi-Agent/ReAct workflows. We explicitly **reject LangGraph** to keep the architecture simple.

## Consequences

- **Pros:** A single framework to learn, maintain, and trace. Codebase remains simple and purely Pythonic without the overhead of LangGraph's graph-based state management.
- **Cons:** We must implement complex loops and multi-step approvals purely in Python with Agno, which requires careful state handling.
