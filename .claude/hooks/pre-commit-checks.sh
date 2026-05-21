#!/usr/bin/env bash
# PreToolUse hook: runs CI-like checks before git commit.
# Mirrors the PR workflow: TypeScript, ESLint, Prettier.
# Outputs {"decision":"deny","reason":"..."} to block the commit on failure.
set -euo pipefail

INPUT=$(cat)

# Quick exit: only gate git commit commands
CMD=$(printf '%s' "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null) || exit 0
[[ "$CMD" =~ (^|[;&|])[[:space:]]*git[[:space:]]+commit([[:space:]]|$) ]] || exit 0

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$PROJECT_ROOT"

ERRORS=()

# shellcheck source=shared-checks.sh
source "$(dirname "$0")/shared-checks.sh"

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  DETAIL=$(printf '\n- %s' "${ERRORS[@]}")
  REASON="Pre-commit checks failed:${DETAIL}"
  REASON_JSON=$(python3 -c "import json, sys; print(json.dumps(sys.argv[1]))" "$REASON")
  echo "{\"decision\":\"deny\",\"reason\":${REASON_JSON}}"
fi
