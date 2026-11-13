#!/usr/bin/env bash

set -Eeuo pipefail

server_pid=''

cleanup() {
  if [[ -n "$server_pid" ]]; then
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

preview_url='http://localhost:4100'
export DEV_SERVER_PROTOCOL='http'
export PLATFORM_UI="$preview_url"

echo "Starting Vite preview server on $preview_url..."
cd /work/platform
npm run preview &
server_pid=$!

preview_ready=false
for _ in {1..30}; do
  if curl --silent --fail --output /dev/null "$preview_url"; then
    preview_ready=true
    break
  fi
  sleep 1
done

if [[ "$preview_ready" != true ]]; then
  echo 'Vite preview did not become ready within 30 seconds.' >&2
  exit 1
fi

echo 'Running Playwright visual tests...'
cd /work/playwright
TAGS='@visual' npx playwright test "${VISUAL_TEST_PATH:-tests/visual/}" \
  --project 'mock chromium' \
  --workers=1 \
  --retries=0 \
  --update-snapshots=all
