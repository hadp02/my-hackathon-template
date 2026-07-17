#!/bin/bash
# Setup tools for my-hackathon-template harness

echo "Initializing Harness database..."
scripts/bin/harness-cli init

echo "Registering tools to Harness Tool Registry..."

# Linter Backend (Ruff)
scripts/bin/harness-cli tool register \
  --name ruff-linter \
  --kind cli \
  --capability lint-backend \
  --command "ruff check ." \
  --description "Python linter for backend services" \
  --responsibility Verification \
  --force

# Linter Frontend (ESLint via npm)
scripts/bin/harness-cli tool register \
  --name eslint-frontend \
  --kind cli \
  --capability lint-frontend \
  --command "npm run lint" \
  --description "ESLint for frontend apps" \
  --responsibility Verification \
  --force

# Testing Backend (Pytest)
scripts/bin/harness-cli tool register \
  --name pytest-backend \
  --kind cli \
  --capability test-backend \
  --command "pytest" \
  --description "Pytest for backend services" \
  --responsibility Verification \
  --force

# Testing Frontend (Vitest)
scripts/bin/harness-cli tool register \
  --name vitest-frontend \
  --kind cli \
  --capability test-frontend \
  --command "npm run test" \
  --description "Vitest for frontend apps" \
  --responsibility Verification \
  --force

echo "Tools registered successfully! Run 'scripts/bin/harness-cli query tools' to verify."
