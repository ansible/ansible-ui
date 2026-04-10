# Plan: PR Risk Analysis — Required + Visible

## Context
Team members can open PRs and request reviews without specifying a risk level. The goal is to:
1. Make risk analysis **visible** so reviewers don't waste time on incomplete PRs
2. Make it a **hard gate** so PRs can't be merged without it

GitHub has no native way to block PR *creation* based on description content. The best achievable enforcement is a combination of immediate visibility signals + merge blocking.

## Approach: Single consolidated workflow

Update `.github/workflows/pr-risk-analysis.yml` to do **three things** in one workflow:

### Step 1 — Validate (existing)
Check the PR body for exactly one checked risk level. Exit with pass/fail.

### Step 2 — On failure: Request changes + label
If no risk level is selected:
- Use `gh pr review` to post a **"Request Changes"** review with a clear message explaining what's needed
- Add a **`missing-risk-analysis`** label to the PR
- This makes the issue immediately visible: the PR shows "Changes requested" status, and the label appears in PR lists

### Step 3 — On success: Clean up
If a valid risk level is selected:
- Dismiss any previous bot review requesting changes (so the "Changes requested" badge goes away)
- Remove the `missing-risk-analysis` label if present

### Files to modify
- `.github/workflows/pr-risk-analysis.yml` — rewrite with the consolidated logic
- `.github/pull_request_template.md` — already updated (no further changes needed)

### Workflow details
- Trigger: `pull_request: [opened, edited, synchronize]`
- Permissions: `pull-requests: write` (for reviews), `contents: read`
- Uses `gh` CLI (available by default on `ubuntu-latest`) with `${{ github.token }}`
- The check job name stays **"Risk Analysis Required"** so it can be added as a required status check in branch protection

### What reviewers will see when risk is missing
1. Red CI check: "Risk Analysis Required — failed"
2. "Changes requested" review badge on the PR
3. `missing-risk-analysis` label in PR list view
4. Bot comment explaining exactly what to do

### Post-merge setup (manual, documented in PR)
Add **"Risk Analysis Required"** as a required status check in branch protection rules for `devel` to block merging.

## Verification
- Open a test PR without checking any risk box → expect: check fails, "Changes requested" review posted, label added
- Edit PR to check a risk level → expect: check passes, review dismissed, label removed
- Check two risk levels → expect: check fails with "select only one" message
