#!/usr/bin/env bash
# Resolve the pull request for a workflow_run job without trusting uploaded artifacts.
# Writes: number=<pr> to $GITHUB_OUTPUT
# Requires env: REPO, HEAD_SHA, PULL_REQUESTS_JSON
set -euo pipefail

if [ -z "${GITHUB_OUTPUT:-}" ]; then
  echo "::error::GITHUB_OUTPUT is not set."
  exit 1
fi

pr=""
count=$(echo "$PULL_REQUESTS_JSON" | jq 'length')

if [ "$count" -eq 1 ]; then
  pr=$(echo "$PULL_REQUESTS_JSON" | jq -r '.[0].number')
elif [ "$count" -gt 1 ]; then
  echo "::error::Ambiguous: $count pull requests linked to workflow run."
  exit 1
fi

if [ -z "$pr" ] || [ "$pr" = "null" ]; then
  pulls=$(gh api "repos/$REPO/commits/$HEAD_SHA/pulls" -H "Accept: application/vnd.github+json")
  pull_count=$(echo "$pulls" | jq 'length')
  if [ "$pull_count" -eq 1 ]; then
    pr=$(echo "$pulls" | jq -r '.[0].number')
  elif [ "$pull_count" -gt 1 ]; then
    echo "::error::Ambiguous: $pull_count pull requests for commit ${HEAD_SHA:0:12}."
    exit 1
  fi
fi

if [ -z "$pr" ] || [ "$pr" = "null" ]; then
  echo "::error::No pull request associated with workflow run (fail closed)."
  exit 1
fi

echo "number=$pr" >> "$GITHUB_OUTPUT"
echo "Resolved PR #$pr for workflow_run (head ${HEAD_SHA:0:12})."