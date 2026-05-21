#!/usr/bin/env bash
# PreToolUse hook (Read): records when a required skill file is read.
#
# Creates a per-skill session marker so the skill-gate hook can verify
# that required skills were actually read before allowing edits.
# shellcheck disable=SC2310
set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('tool_input', {}).get('file_path', ''))
" 2>/dev/null) || exit 0

[[ -z "$FILE_PATH" ]] && exit 0

# Only track reads of skill files
[[ "$FILE_PATH" == */.claude/skills/*.md ]] || exit 0

SESSION_ID="${CLAUDE_SESSION_ID:-$$}"
SKILL_NAME=$(basename "$FILE_PATH" .md)
touch "/tmp/claude-skill-gate-${SESSION_ID}-ack-${SKILL_NAME}"
