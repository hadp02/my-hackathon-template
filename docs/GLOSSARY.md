# Glossary

This glossary defines the shared vocabulary for the team and AI Agents working in this repository.

## Agent
An AI coding collaborator operating inside the repository.

## Harness
The repo-level operating system (rules, docs, backlog) that tells humans and agents how to turn intent into safe product changes.

## Product Contract
The current expected behavior of the product. Product docs plus executable tests become the living contract once implementation exists.

## Story Packet
A story-sized work file or folder that describes the product contract, affected docs, design notes, and validation expectations for a feature.

## Verification Gate
A mandatory check that runs or inspects mechanical proof before a task is closed. This typically involves running `make test`, `make lint`, or a specific CI pipeline.

## Context Phase
A phase of an agent task that changes what context should be read, such as Intake, Planning, Implementation, Validation, or Trace recording. (See `AI_WORKFLOW_RULES.md`).

## Retrieval Trigger
A condition that tells an agent to fetch additional context, such as touching a database schema, changing a public contract, or discovering missing validation.

## Harness Delta
A documentation, template, validation, backlog, or decision update that makes future agent work safer or easier.

## Product Delta
A product-facing change such as code, tests, API shape, data model, or product documentation.

## Trace
A structured record of what an agent did during a task: actions taken, files read, files changed, decisions made, errors encountered, and outcome. (Often recorded in `SYSTEM_TASKS.md`).
