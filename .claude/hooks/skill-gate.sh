#!/usr/bin/env bash
# PreToolUse hook (Edit|Write): blocks edits to source files unless the
# required skill files for that file category have been acknowledged.
#
# Reads the skill-to-file mapping from .claude/skill-triggers.json
# (single source of truth). Uses per-category session markers so each
# file type triggers its own skill-loading prompt independently.
#
# Works with skill-ack.sh (Read hook) which creates per-skill ack markers
# when skill files are read. This hook only allows edits once ALL required
# skill ack markers exist for the file category.
#
# Outputs {"decision":"deny","reason":"..."} when skills haven't been read.
# Falls through silently for non-source files and already-gated categories.
set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(printf '%s' "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('tool_input', {}).get('file_path', ''))
" 2>/dev/null) || exit 0

[[ -z "$FILE_PATH" ]] && exit 0

# Only gate TypeScript/TSX files inside frontend/, platform/, framework/, or playwright/
[[ "$FILE_PATH" == *frontend/* || "$FILE_PATH" == *platform/* || "$FILE_PATH" == *framework/* || "$FILE_PATH" == *playwright/* ]] || exit 0
[[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]] || exit 0

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
TRIGGERS_FILE="${PROJECT_ROOT}/.claude/skill-triggers.json"

[[ -f "$TRIGGERS_FILE" ]] || exit 0

# Resolve category and skills from the JSON config
RESULT=$(python3 -c "
import json, sys, fnmatch

file_path = sys.argv[1]
with open(sys.argv[2]) as f:
    config = json.load(f)

for category, info in config.get('categories', {}).items():
    for pattern in info.get('patterns', []):
        if fnmatch.fnmatch(file_path, pattern):
            skills = info.get('skills', [])
            print(category)
            print('\n'.join(skills))
            sys.exit(0)
" "$FILE_PATH" "$TRIGGERS_FILE" 2>/dev/null) || exit 0

[[ -z "$RESULT" ]] && exit 0

# Sanitize category to alphanumeric, underscore, and hyphen only
CATEGORY=$(echo "$RESULT" | head -1 | tr -cd '[:alnum:]_-')
SKILLS=()
while IFS= read -r line; do
  [[ -n "$line" ]] && SKILLS+=("$line")
done < <(echo "$RESULT" | tail -n +2)

[[ -z "$CATEGORY" ]] && exit 0
[[ ${#SKILLS[@]} -eq 0 ]] && exit 0

# Per-category session marker
SESSION_ID="${CLAUDE_SESSION_ID:-$$}"
MARKER="/tmp/claude-skill-gate-${SESSION_ID}-${CATEGORY}"

if [[ -f "$MARKER" ]]; then
  exit 0
fi

# Verify that all required skill files have been read this session
ALL_READ=true
MISSING=()
for skill_file in "${SKILLS[@]}"; do
  skill_name=$(basename "$skill_file" .md)
  ack_marker="/tmp/claude-skill-gate-${SESSION_ID}-ack-${skill_name}"
  if [[ ! -f "$ack_marker" ]]; then
    ALL_READ=false
    MISSING+=("$skill_file")
  fi
done

if [[ "$ALL_READ" == "true" ]]; then
  touch "$MARKER"
  exit 0
fi

SKILL_LIST=""
for s in "${MISSING[@]}"; do
  SKILL_LIST="${SKILL_LIST}\n  - ${s}"
done
REASON="STOP: Before editing ${CATEGORY} files, you must read these skill files:${SKILL_LIST}\n\nRead each file now with the Read tool, then retry this edit."
REASON_JSON=$(python3 -c "import json, sys; print(json.dumps(sys.argv[1]))" "$REASON")
echo "{\"decision\":\"deny\",\"reason\":${REASON_JSON}}"
