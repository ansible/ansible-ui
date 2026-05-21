#!/usr/bin/env bash
# PostToolUse hook: auto-format files after Edit/Write using project Prettier config.
# Receives JSON on stdin with tool_input.file_path.
set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(d.get('tool_input', {}).get('file_path', ''))
" 2>/dev/null) || exit 0

[[ -z "$FILE_PATH" ]] && exit 0

# Reject paths with newlines or null bytes (command-injection defense)
[[ "$FILE_PATH" == *$'\n'* || "$FILE_PATH" == *$'\0'* ]] && exit 0

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
FILE_PATH=$(python3 -c "
import os, sys
root, path = sys.argv[1], sys.argv[2]
if not os.path.isabs(path):
    path = os.path.join(root, path)
print(os.path.realpath(path))
" "$PROJECT_ROOT" "$FILE_PATH" 2>/dev/null) || exit 0

[[ -f "$FILE_PATH" ]] || exit 0

# Ensure file is inside this project (using canonical paths)
[[ "$FILE_PATH" == "$PROJECT_ROOT"/* ]] || exit 0

# Only format file types Prettier handles in this project
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.scss|*.md|*.yaml|*.yml|*.html)
    cd "$PROJECT_ROOT"
    npx prettier --write "$FILE_PATH" >/dev/null 2>&1 || true
    ;;
esac
