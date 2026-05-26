#!/usr/bin/env bash
# Shared CI-mirroring checks used by pre-commit hooks.
# Expects PROJECT_ROOT to be set by the caller.
# Appends failures to the ERRORS array.

# 1. TypeScript type check
echo "Running TypeScript type check..." >&2
npm run tsc >&2 || {
  ERRORS+=("TypeScript: run 'npm run tsc'")
}

# 2. ESLint
echo "Running ESLint..." >&2
npm run eslint >&2 || {
  ERRORS+=("ESLint: run 'npm run eslint'")
}

# 3. Prettier formatting check
echo "Running Prettier check..." >&2
npm run prettier >&2 || {
  ERRORS+=("Formatting: run 'npm run prettier:fix'")
}
