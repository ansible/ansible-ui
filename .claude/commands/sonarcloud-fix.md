# Fix SonarCloud Issues

Follow **Phase B — Fix** in `.claude/skills/sonarcloud-remediation/sonarcloud-remediation.md`.

If the user passes `--help`, display the usage information below and stop.

## Usage

```
/sonarcloud-fix [group-number-or-name]
```

Remediates SonarCloud issues for a selected group with a 2-step approval process:
1. **Approval 1 — Apply & Test**: Fixes are applied, validated, committed to a branch. You can test locally and make manual adjustments before proceeding.
2. **Approval 2 — Create PR(s)/MR(s)**: After reviewing the branch, you explicitly approve PR/MR creation. A summary of how many PRs/MRs will be created is shown first.

### Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `group` | Group number or name from `/sonarcloud-analyze` output. If omitted, you will be prompted to select interactively. | `3` or `S1854-frontend-awx` |
| `--help` | Show this usage information | |

### Environment Variables

Same as `/sonarcloud-analyze` (including the requirement that `SONARCLOUD_TOKEN` must be an env var, never interactive), plus these Phase B variables (set beforehand or provided interactively):

| Variable | Purpose |
|----------|---------|
| `SONAR_DEFAULT_BRANCH` | Base branch for fix PRs (e.g. `main`, `devel`) |
| `SONAR_VALIDATE_COMMANDS` | Validation commands that must pass before PR creation |
| `SONAR_PR_COMMENT` | Comment posted on each PR/MR (e.g. `/run-playwright`). Set to `none`, `skip`, `false`, or `""` to disable. |

### Permissions

Add to a **local** `.claude/settings.json` (not committed; see `AI_AGENT_POLICY.md`) to avoid permission prompts:
```json
"Bash(python3 *sonarcloud-fetch.py*)"
```

### Workflow

1. **Configuration pre-check**: Prompt interactively for any missing Phase B variables (branch, validation commands, PR comment), then display all configuration for confirmation. Skipped if already confirmed in the current session.
2. If no analysis exists in this session, run `/sonarcloud-analyze` first
3. If no group argument provided, display available groups and prompt for selection
4. Read affected files, present fixes as a group for review
5. **Approval 1 — Apply fixes:**
   - Apply approved fixes (cap ~200 LOC per batch, auto-split larger groups)
   - Run validation commands (hard gate — must pass)
   - Create branch and commit changes
   - **Pause**: Inform the engineer the branch is ready for local testing. They can review the diff, run additional tests, or commit manual adjustments. Wait for explicit go-ahead.
6. **Approval 2 — Create PR(s)/MR(s):**
   - Present a summary: number of PRs/MRs to be created, LOC per PR/MR, target branch
   - Wait for explicit approval before creating any PR/MR
   - Create PR(s)/MR(s) with title prefixed `SonarCloud Fix:` (e.g., `SonarCloud Fix: Remove dead stores (S1854, frontend/awx)`)
   - PR/MR body follows repo template (`.github/pull_request_template.md` or `.gitlab/merge_request_templates/`)
   - Post `SONAR_PR_COMMENT` on each PR/MR (if configured)
7. Offer to continue with the next group
