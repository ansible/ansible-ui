# Final Implementation Plan — SonarCloud Remediation Skill

## Context

SonarCloud shows ~2700 open issues for this project. Engineers currently triage and fix these manually — navigating the dashboard, reviewing each issue, researching fixes, and creating PRs by hand. This story delivers a Claude Code skill that automates analysis and remediation with human-in-the-loop review, starting with low-risk fix categories to build trust.

**Reference implementation**: [amazon.aws PR #2919](https://github.com/ansible-collections/amazon.aws/pull/2919) — proved that curl-based SonarCloud API calls in skill markdown work. We adapt this pattern for a TypeScript/React monorepo context.

---

## Architecture Decision

Direct SonarCloud API integration via `curl` in skill markdown — no custom API client, no MCP server, no coded application. Claude Code skills are instruction files. The amazon.aws PR proved this pattern works at scale.

---

## Prerequisites

- **`gh`** (GitHub CLI) — must be installed and authenticated (`gh auth login`). Used by `/sonarcloud-fix` to create PRs and post e2e trigger comments.
- **`curl`** — used for SonarCloud API calls.

---

## File Structure

```
.claude/
  skills/
    sonarcloud-remediation.md     — Full workflow logic (analyze + fix)
  commands/
    sonarcloud-analyze.md         — /sonarcloud-analyze command (thin wrapper)
    sonarcloud-fix.md             — /sonarcloud-fix command (thin wrapper)
```

**Existing files unchanged**: `commands/migrate-test.md`, `commands/review-pr.md`, `skills/pr_review.md`, `settings.json`

---

## Environment Variables

No hardcoded project keys. The skill reads env vars (matching CI pipeline conventions):

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `SONAR_ORGANIZATION` | Yes | Your SonarCloud organization slug | SonarCloud org |
| `SONAR_PROJECT_KEY` | Yes | Your SonarCloud project key | Project identifier |
| `SONARCLOUD_TOKEN` | Only for private projects | — | API auth token |
| `SONAR_DEFAULT_BRANCH` | No (default: `devel`) | `main` | Base branch for fix PRs |
| `SONAR_VALIDATE_COMMANDS` | No (default: `npm run tsc && npm run vitest`) | `make lint && make test` | Validation commands that must pass before PR creation |
| `SONAR_E2E_TRIGGER_COMMENT` | No (default: `/run-playwright`) | `/run-e2e` | Comment to post on PR to trigger e2e tests |

The skill validates `SONAR_ORGANIZATION` and `SONAR_PROJECT_KEY` at runtime with a clear error if missing.

---

## Workflow

### Phase A — Analyze (`/sonarcloud-analyze`)

Both commands support a `--help` flag that displays usage information and exits without performing any action.

1. **Validate environment** — check `SONAR_ORGANIZATION` and `SONAR_PROJECT_KEY` are set
2. **Fetch issues** from SonarCloud API (`/api/issues/search`) with pagination (max 500/page); also fetch hotspots via `/api/hotspots/search`
3. **Categorize by the 5 SonarCloud categories**:
   - Security (vulnerabilities)
   - Reliability (bugs)
   - Maintainability (code smells)
   - Security Hotspots (hotspots with status `TO_REVIEW`)
   - Duplication (duplicated blocks — fetched via `/api/measures/component` or identified from code smell rules)
4. **Within each category, group by SonarCloud rule + aap-ui workspace** (awx, eda, hub, framework, platform, common, chatbot) — e.g., "Dead store (typescript:S1854) — AWX (12 issues)"
5. **Sort groups by remediation priority** (within each category):
   1. Unused imports and variables
   2. Dead code / dead stores
   3. Duplicate string literals (extract to constants)
   4. Unused function parameters
   5. Commented-out code removal
   6. Simple type safety improvements
   7. Cognitive complexity refactoring
   8. Security hotspot remediation
   9. Reliability bug fixes
6. **Present a prioritized summary table** per category, using **continuous group numbering across all categories** (the group `#` is globally unique, not reset per category — this is the ID that `/sonarcloud-fix` uses to select groups):
   ```
   ## Maintainability (847 issues)

   | # | Group                              | Workspace | Count | Severity | Est. LOC |
   |---|------------------------------------|-----------|-------|----------|----------|
   | 1 | Unused imports (typescript:S1128)   | AWX       |   45  | Minor    |   ~90    |
   | 2 | Dead stores (typescript:S1854)      | AWX       |   23  | Major    |   ~46    |
   | 3 | Duplicate strings (typescript:S1192)| Framework |   12  | Minor    |   ~60    |
   ...
   ```
7. **Flag groups exceeding 200 LOC** with a note that they will auto-split into multiple PRs
8. **Support optional flags**: `--severity <level>` to filter by severity, `--workspace <name>` to filter by workspace

### Phase B — Fix (`/sonarcloud-fix`)

The fix workflow uses a **2-step approval process** to give engineers full control:

1. **Engineer selects one or more groups** from the analyze output (by number or name)
2. **Read all affected files** for the selected group(s); analyze each issue in its code context
3. **Present fixes as a group for human approval** — not individually. Display:
   - Group summary: rule, workspace, count, severity
   - Table of all fixes: file, line, issue description, proposed change (before/after snippet)
   - Estimated total LOC changed
   - Risk assessment for the group (Low / Medium / High)
4. **Engineer approves, rejects, or modifies the group** (approve all / reject all / exclude specific files)
5. **Apply approved fixes**, capping at ~200 LOC per PR:
   - If the group exceeds 200 LOC, auto-split into multiple batches (by file or logical grouping)
   - Each batch becomes its own PR
6. **Validate — hard gate**:
   - Run `SONAR_VALIDATE_COMMANDS` (default: `npm run tsc && npm run vitest`)
   - If validation fails, diagnose, fix, and re-validate before proceeding
7. **Create branch** off the configured default branch (`SONAR_DEFAULT_BRANCH` or `devel`):
   - Branch name: `sonar/<rule-key>-<workspace>` (e.g., `sonar/S1854-awx`)
8. **Commit** with descriptive message referencing SonarCloud issue keys:
   ```
   fix: remove dead stores in AWX components (SonarCloud S1854)

   Addresses 23 typescript:S1854 violations in frontend/awx/.
   SonarCloud keys: AZxx1, AZxx2, ...
   ```
9. **Approval 1 — Apply & Test**: Pause and inform the engineer the branch is ready for local testing. They can review the diff, run additional tests, or commit manual adjustments. **Wait for explicit go-ahead before proceeding to PR creation.**
10. **Approval 2 — Create PR(s)**: Present a summary of how many PRs will be created, LOC per PR, and target branch. Wait for explicit approval, then create PR(s):
    - **PR title** must use the format: `SonarCloud Fix: <description> (<rule key>, <workspace>)` (e.g., `SonarCloud Fix: Remove dead stores (S1854, AWX)`). For batched PRs, append `[batch 1/N]`.
    - **PR body** follows `.github/pull_request_template.md`:
      - **Summary**: Which SonarCloud rule was fixed, which workspace, issue count, link to SonarCloud dashboard
      - **Type of Change**: Bug fix or Enhancement (depending on category)
      - **Risk Analysis (required)**: Low for dead code/unused imports; Medium for code smell refactors touching shared paths; High for security/reliability fixes in shared components
      - **Testing**: Validation pass confirmed pre-PR. E2E trigger comment posted after PR creation.
11. **Post `SONAR_E2E_TRIGGER_COMMENT`** (default: `/run-playwright`) comment on the PR to trigger e2e tests
12. **Offer to continue** — return to group selection for the next batch

---

## Scope

### In scope (this story):
- **Skill creation**: `/sonarcloud-analyze` and `/sonarcloud-fix` skills + command wrappers
- **Documentation**: Setup instructions, env var configuration, troubleshooting, portability guide
- **Validation testing**: Run the skills against 1-2 small groups (e.g., unused imports in one workspace) to verify end-to-end functionality — analyze, group-level approval, fix application, validation gates, branch/PR creation

### Follow-on stories:
- **Remediation campaigns** — systematic use of the skills to fix outstanding SonarCloud issues, starting with low-risk categories (unused imports, dead stores, duplicate strings, unused params, commented-out code, type safety)
- **Cross-team adoption** — contribute the skill to a shared marketplace repo for use across teams

---

## TypeScript/React Fix Strategies

| Rule Pattern | Fix Strategy |
|---|---|
| Unused imports/variables | Remove dead references; verify no side-effect imports |
| Dead stores | Remove unused assignments; check for intentional destructuring |
| Duplicate strings | Extract to named `const` in same file or nearest shared module |
| Unused function parameters | Remove if internal; prefix with `_` if interface-required |
| Commented-out code | Remove entirely (git history preserves it) |
| Type safety (`any`) | Add proper TypeScript types; use existing interfaces from workspace |

---

## Portability for Other Teams

The skill is designed for adoption beyond aap-ui:

1. **No hardcoded project keys** — everything via env vars
2. **Configurable default branch** — `SONAR_DEFAULT_BRANCH` (defaults to `devel`)
3. **Workspace grouping is optional** — if the target repo isn't a monorepo, issues group by directory instead
4. **Validation commands are configurable** — set `SONAR_VALIDATE_COMMANDS` to your project's pipeline; set `SONAR_E2E_TRIGGER_COMMENT` for your e2e trigger
5. **Skill header includes setup instructions** — env var configuration, prerequisites, troubleshooting

---

## AC Mapping

| AC | Deliverable |
|----|-------------|
| AC1 (Skill Installation) | `.claude/skills/sonarcloud-remediation.md` + commands in `.claude/commands/` |
| AC2 (Authentication) | Skill validates env vars at runtime; `SONARCLOUD_TOKEN` for private projects; no secrets committed |
| AC3 (Issue Analysis) | `/sonarcloud-analyze` with 5-category grouping, rule+workspace sub-groups, priority sorting, severity/workspace flags |
| AC4 (Configuration) | Environment variables matching CI pipeline; configurable default branch |
| AC5 (Documentation) | Skill header docs + command docs + setup/troubleshooting in skill preamble |
| AC6 (Validation) | Tested against project SonarCloud data during implementation |

---

## What This Does NOT Change

- No changes to aap-ui application source code (this PR delivers the skill files only)
- No new dependencies in package.json
- No modifications to settings.json (env vars are set by the user, not committed)
- No hardcoded project keys or tokens

---

## Files to Create

1. **`.claude/skills/sonarcloud-remediation.md`** — Main skill file (~300-400 lines). Contains: env var validation, SonarCloud API curl templates, grouping/sorting logic, fix strategies, validation gates, PR creation workflow, portability notes.
2. **`.claude/commands/sonarcloud-analyze.md`** — Thin command wrapper (~10-15 lines). Invokes the analyze phase of the skill.
3. **`.claude/commands/sonarcloud-fix.md`** — Thin command wrapper (~10-15 lines). Invokes the fix phase of the skill.

---

## Verification

1. Set env vars: `SONAR_ORGANIZATION=<your-org>`, `SONAR_PROJECT_KEY=<your-project-key>`
2. Run `/sonarcloud-analyze --help` and `/sonarcloud-fix --help` — verify usage information is displayed
3. Run `/sonarcloud-analyze` — verify it fetches issues, groups by 5 categories, sorts by priority, shows summary table with continuous group numbering
4. Run `/sonarcloud-fix` — select a small group (e.g., unused imports in one workspace), verify group-level approval flow, LOC cap, branch creation, validation gates
5. Confirm validation commands pass before PR
6. Verify Approval 1 pauses for engineer review before PR creation
7. Verify Approval 2 presents PR summary and waits for explicit go-ahead
8. Verify PR title uses `SonarCloud Fix:` prefix format
9. Verify PR body follows `.github/pull_request_template.md` format with risk analysis

---

## Branch Strategy

- Branch skill development from `devel` on origin
- PR targets `devel`
