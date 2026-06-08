#!/bin/bash
# Orchestrates local Linux visual baseline generation via Podman
# Updates -linux.png snapshots in playwright/tests/visual/*-snapshots/

set -e

# Validate PLATFORM_SERVER
if [ -z "$PLATFORM_SERVER" ]; then
  echo "Error: PLATFORM_SERVER environment variable is required"
  echo ""
  echo "Usage: PLATFORM_SERVER=https://your-aap-instance ./scripts/update-visual-baselines.sh [test-file]"
  echo ""
  echo "Examples:"
  echo "  PLATFORM_SERVER=https://3.89.120.97 ./scripts/update-visual-baselines.sh"
  echo "  PLATFORM_SERVER=https://3.89.120.97 ./scripts/update-visual-baselines.sh tests/visual/overview-visual.spec.ts"
  exit 1
fi

# Optional test file argument (default: all visual tests)
TEST_ARG="${1:-tests/visual/}"

# Get project root (script is in scripts/, project root is one level up)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "=== AAP UI Visual Baseline Update ==="
echo "PLATFORM_SERVER: $PLATFORM_SERVER"
echo "Test path: $TEST_ARG"
echo ""

# Step 1: Build the image
echo "[1/3] Building container image..."
podman build -f platform/Containerfile --target platform-ui -t aap-ui-visual .

# Step 2: Run container with volume mount
echo ""
echo "[2/3] Running snapshot update in container..."
echo "This may take several minutes..."
echo ""

podman run --rm \
  -e PLATFORM_SERVER="$PLATFORM_SERVER" \
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
