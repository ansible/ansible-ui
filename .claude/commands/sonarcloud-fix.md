# Fix SonarCloud Issues

Follow **Phase B — Fix** in `.claude/skills/sonarcloud-remediation.md`.

If the user passes `--help`, display the usage information below and stop.

## Usage

```
/sonarcloud-fix [group-number-or-name]
```

Remediates SonarCloud issues for a selected group with a 2-step approval process:
1. **Approval 1 — Apply & Test**: Fixes are applied, validated, committed to a branch. You can test locally and make manual adjustments before proceeding.
2. **Approval 2 — Create PR(s)**: After reviewing the branch, you explicitly approve PR creation. A summary of how many PRs will be created is shown first.

### Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| `group` | Group number or name from `/sonarcloud-analyze` output. If omitted, you will be prompted to select interactively. | `3` or `S1854-AWX` |
| `--help` | Show this usage information | |

### Required Environment Variables

Same as `/sonarcloud-analyze`, plus optional:

| Variable | Default | Purpose |
|----------|---------|---------|
| `SONAR_DEFAULT_BRANCH` | `devel` | Base branch for fix PRs |
| `SONAR_VALIDATE_COMMANDS` | `npm run tsc && npm run vitest` | Validation gate commands |
| `SONAR_E2E_TRIGGER_COMMENT` | `/run-playwright` | Comment posted on PR to trigger e2e tests |

### Permissions

Add to `.claude/settings.json` to avoid permission prompts:
```json
"Bash(curl -s *sonarcloud.io*)"
```

### Workflow

1. If no analysis exists in this session, run `/sonarcloud-analyze` first
2. If no group argument provided, display available groups and prompt for selection
3. Read affected files, present fixes as a group for review
4. **Approval 1 — Apply fixes:**
   - Apply approved fixes (cap ~200 LOC per batch, auto-split larger groups)
   - Run validation commands (hard gate — must pass)
   - Create branch and commit changes
   - **Pause**: Inform the engineer the branch is ready for local testing. They can review the diff, run additional tests, or commit manual adjustments. Wait for explicit go-ahead.
5. **Approval 2 — Create PR(s):**
   - Present a summary: number of PRs to be created, LOC per PR, target branch
   - Wait for explicit approval before creating any PR
   - Create PR(s) following `.github/pull_request_template.md`
   - Post e2e trigger comment on each PR
6. Offer to continue with the next group
