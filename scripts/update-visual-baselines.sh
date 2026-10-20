#!/bin/bash
# Orchestrates local Linux visual baseline generation via Podman or Docker
# Updates -linux.png snapshots in playwright/tests/visual/*-snapshots/

set -e

# Optional test file argument (default: all visual tests)
TEST_ARG="${1:-tests/visual/}"

if command -v podman >/dev/null 2>&1; then
  CONTAINER_RUNTIME=podman
elif command -v docker >/dev/null 2>&1; then
  CONTAINER_RUNTIME=docker
else
  echo "Error: Podman or Docker is required"
  exit 1
fi

# Get project root (script is in scripts/, project root is one level up)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "=== AAP UI Visual Baseline Update ==="
echo "Container runtime: $CONTAINER_RUNTIME"
echo "Project: deterministic mock API"
echo "Test path: $TEST_ARG"
echo ""

# Step 1: Build the image
echo "[1/3] Building container image..."
$CONTAINER_RUNTIME build -f platform/Containerfile --target platform-ui -t aap-ui-visual .

# Step 2: Run container with volume mount
echo ""
echo "[2/3] Running snapshot update in container..."
echo "This may take several minutes..."
echo ""

$CONTAINER_RUNTIME run --rm \
  -e VISUAL_TEST_PATH="$TEST_ARG" \
  -e SKIP_COVERAGE=true \
  -v "$PROJECT_ROOT/playwright/tests/visual:/work/playwright/tests/visual:z" \
  aap-ui-visual

# Step 3: Summary
echo ""
echo "[3/3] Snapshot update complete!"
echo ""
echo "Updated files:"
git status --short playwright/tests/visual/ | grep '\.png$' || echo "  (no .png files modified)"

echo ""
echo "Next steps:"
echo "  1. Review changes: git diff playwright/tests/visual/"
echo "  2. Add snapshots: git add playwright/tests/visual/**/*-linux.png"
echo "  3. Commit: git commit -m 'chore: update Linux visual baselines'"
