# Claude Skill: SonarCloud Issue Remediation

Fetch SonarCloud issues, analyze and group them, suggest fixes, and create focused PRs with human-in-the-loop review.

---

## Setup

### Prerequisites

- **`gh`** (GitHub CLI) — must be installed and authenticated (`gh auth login`). Used by `/sonarcloud-fix` to create PRs and post e2e trigger comments.
- **`curl`** — used for SonarCloud API calls.

### Required Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SONAR_ORGANIZATION` | Yes | SonarCloud organization slug |
| `SONAR_PROJECT_KEY` | Yes | SonarCloud project key |
| `SONARCLOUD_TOKEN` | Only for private projects | API authentication token |
| `SONAR_DEFAULT_BRANCH` | No (default: `devel`) | Base branch for fix PRs |
| `SONAR_VALIDATE_COMMANDS` | No (default: `npm run tsc && npm run vitest`) | Validation commands that must pass before PR creation |
| `SONAR_E2E_TRIGGER_COMMENT` | No (default: `/run-playwright`) | Comment to post on PR to trigger e2e tests |

### Validate Environment

Before any operation, check that required env vars are set:

```bash
if [ -z "$SONAR_ORGANIZATION" ] || [ -z "$SONAR_PROJECT_KEY" ]; then
  echo "ERROR: SONAR_ORGANIZATION and SONAR_PROJECT_KEY must be set."
  echo ""
  echo "Example:"
  echo "  export SONAR_ORGANIZATION=your-org"
  echo "  export SONAR_PROJECT_KEY=your-project-key"
  echo "  export SONARCLOUD_TOKEN=your-token  # only for private projects"
  exit 1
fi
```

### Authentication

For public projects, no token is needed (read-only API). For private projects, use the token:

```bash
# Public project
curl -s "https://sonarcloud.io/api/issues/search?..."

# Private project
curl -s -u "${SONARCLOUD_TOKEN}:" "https://sonarcloud.io/api/issues/search?..."
```

---

## Phase A — Analyze

Invoked via `/sonarcloud-analyze`. Fetches all open issues and presents a prioritized, grouped report.

### Step 1: Fetch Issues

Fetch unresolved issues with pagination. SonarCloud caps at 500 per page.

**Issues (bugs, vulnerabilities, code smells):**
```bash
curl -s "https://sonarcloud.io/api/issues/search?componentKeys=${SONAR_PROJECT_KEY}&resolved=false&ps=500&p=1"
```

If the response `total` exceeds 500, paginate:
```bash
curl -s "https://sonarcloud.io/api/issues/search?componentKeys=${SONAR_PROJECT_KEY}&resolved=false&ps=500&p=2"
```

**Security hotspots:**
```bash
curl -s "https://sonarcloud.io/api/hotspots/search?projectKey=${SONAR_PROJECT_KEY}&status=TO_REVIEW&ps=500&p=1"
```

**Duplication metrics:**
```bash
curl -s "https://sonarcloud.io/api/measures/component?component=${SONAR_PROJECT_KEY}&metricKeys=duplicated_lines_density,duplicated_blocks,duplicated_files"
```

Parse each JSON response. For issues, extract: `key`, `component` (file path), `type` (BUG, VULNERABILITY, CODE_SMELL), `severity`, `line`, `message`, `rule`.

### Step 2: Categorize by SonarCloud Category

Group all fetched issues into the 5 SonarCloud categories:

| Category | Source | Filter |
|----------|--------|--------|
| **Security** | `/api/issues/search` | `type=VULNERABILITY` |
| **Reliability** | `/api/issues/search` | `type=BUG` |
| **Maintainability** | `/api/issues/search` | `type=CODE_SMELL` |
| **Security Hotspots** | `/api/hotspots/search` | `status=TO_REVIEW` |
| **Duplication** | `/api/measures/component` | `duplicated_blocks` metric; also code smell rules related to duplication (e.g., `typescript:S1192`) |

### Step 3: Group by Rule + Workspace

Within each category, group issues by **SonarCloud rule key** and **workspace**.

Detect workspace from the file path `component` field:

| Path prefix | Workspace |
|-------------|-----------|
| `frontend/awx/` | AWX |
| `frontend/eda/` | EDA |
| `frontend/hub/` | Hub |
| `frontend/common/` | Common |
| `frontend/chatbot/` | Chatbot |
| `framework/` | Framework |
| `platform/` | Platform |
| `cypress/` or `playwright/` | Tests |
| Other | Root |

For non-monorepo projects, group by top-level directory instead.

Each group is identified as: `<rule key> — <workspace>` (e.g., `typescript:S1854 — AWX`).

### Step 4: Sort by Remediation Priority

Within each category, sort groups by this priority order:

1. Unused imports and variables (`S1128`, `S1481`)
2. Dead code / dead stores (`S1854`, `S1186`)
3. Duplicate string literals (`S1192`)
4. Unused function parameters (`S1172`)
5. Commented-out code (`S125`)
6. Simple type safety improvements (`S4325`, `S4204`)
7. Cognitive complexity (`S3776`)
8. Security hotspot rules
9. Reliability / bug rules
10. All other rules

Rules not matching any priority bucket sort to the end, ordered by issue count descending.

### Step 5: Estimate LOC Impact

For each group, estimate the lines of code that will change:
- Unused imports: ~1 LOC per issue (removal)
- Dead stores: ~1-2 LOC per issue
- Duplicate strings: ~2-3 LOC per issue (extract to const + references)
- Unused parameters: ~1 LOC per issue
- Commented-out code: variable, count the commented lines from issue details
- Type safety: ~1-3 LOC per issue
- Cognitive complexity: ~10-20 LOC per issue (refactoring)

### Step 6: Present Summary Table

Display one table per category. Include total issue count in the heading.

**CRITICAL: Use a single continuous numbering sequence across all categories.** The group `#` is the ID that `/sonarcloud-fix` uses to select groups. It must be globally unique, not reset per category. All rows — including security hotspots — must use the same table format with the rule or category identifier in parentheses.

```
## Maintainability (847 issues)

| # | Group                              | Workspace | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------|-------|----------|----------|-----------|
| 1 | Unused imports (typescript:S1128)   | AWX       |   45  | Minor    |   ~45    |           |
| 2 | Dead stores (typescript:S1854)      | AWX       |   23  | Major    |   ~35    |           |
| 3 | Duplicate strings (typescript:S1192)| Framework |   12  | Minor    |   ~36    |           |
| 4 | Cognitive complexity (typescript:S3776) | Hub   |   8   | Critical |  ~120    | Will split |
...

## Reliability (42 issues)

| # | Group                              | Workspace | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------|-------|----------|----------|-----------|
| 5 | Constant nullishness (typescript:S6638) | AWX   |   2   | Major    |    ~4    |           |
...

## Security (5 issues)

| # | Group                              | Workspace | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------|-------|----------|----------|-----------|
| 8 | SQL injection (typescript:S2077)    | Hub       |   1   | Blocker  |    ~5    |           |
...

## Security Hotspots (18 issues)

| # | Group                              | Workspace | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------|-------|----------|----------|-----------|
|11 | Weak cryptography (weak-cryptography) | AWX     |   3   | Medium   |    ~6    |           |
|12 | Data encryption (encrypt-data)     | AWX       |   1   | Low      |    ~2    |           |
...

## Duplication
Duplicated lines density: 3.2%  |  Duplicated blocks: 47  |  Duplicated files: 12
(Duplicate string literal issues are listed under Maintainability above.)
```

Flag any group where Est. LOC > 200 with "Will split" in the Note column.

At the end of the report, suggest low-risk starting groups for `/sonarcloud-fix` using their group numbers:
```
Good starting groups for `/sonarcloud-fix`:
  /sonarcloud-fix 1   — Unused imports (45 issues, ~45 LOC, Low risk)
  /sonarcloud-fix 2   — Dead stores (23 issues, ~35 LOC, Low risk)
```

### Optional Filters

If the user provides flags, apply them before grouping:

- `--severity <BLOCKER|CRITICAL|MAJOR|MINOR|INFO>` — only show issues at or above this severity
- `--workspace <name>` — only show issues in the specified workspace

---

## Phase B — Fix

Invoked via `/sonarcloud-fix`. The engineer selects groups from the analyze output and the skill applies fixes with approval.

### Step 1: Select Groups

If the user provided a group number or name as an argument, use that.

If no group was specified, prompt interactively:
1. If no `/sonarcloud-analyze` was run in this session, run it first to generate the group table
2. Display the available groups (or remind the user of the table)
3. Ask which group(s) to fix — accept by number from the analyze table, by rule key, or by name
4. Multiple groups can be selected at once

### Step 2: Read Affected Files

For each issue in the selected group(s):
1. Read the affected file using the Read tool
2. Focus on the specific line number and surrounding context (~10 lines above/below)
3. Identify whether the issue is a true positive or false positive

### Step 3: Present Fixes as a Group

**CRITICAL: Present fixes at the group level, not individually.** With thousands of open issues, per-fix approval is not efficient.

Display:

```
## Group: Unused imports (typescript:S1128) — AWX (45 issues)

**Severity:** Minor  |  **Risk:** Low  |  **Est. LOC changed:** ~45

| # | File                                          | Line | Issue                        | Proposed Fix          |
|---|-----------------------------------------------|------|------------------------------|-----------------------|
| 1 | frontend/awx/views/jobs/JobsList.tsx           |   3  | Remove unused import `Foo`   | Delete import line    |
| 2 | frontend/awx/views/jobs/JobsList.tsx           |   7  | Remove unused import `Bar`   | Delete import line    |
| 3 | frontend/awx/components/ResourceCard.tsx       |  12  | Remove unused import `Baz`   | Delete import line    |
...

**Risk Assessment:** Low — removing unused imports has no runtime effect.
```

### Step 4: Get Fix Approval

Ask the engineer to:
- **Approve all** — apply every fix in the group
- **Exclude specific files** — list file numbers to skip
- **Reject** — skip this group entirely

### TypeScript/React Fix Strategies

| Rule Pattern | Fix Strategy | Caution |
|---|---|---|
| Unused imports | Remove the import line | Check for side-effect imports (e.g., CSS imports, polyfills) — do not remove those |
| Dead stores | Remove the unused assignment | Check for intentional destructuring patterns |
| Duplicate strings | Extract to a named `const` at the top of the file | Use descriptive names; check if a shared constant already exists in the workspace |
| Unused function parameters | Remove if internal function; prefix with `_` if required by an interface or callback signature | Verify the function isn't part of a public API |
| Commented-out code | Delete entirely | Git history preserves it; no need to keep |
| Type safety (`any`) | Replace with proper TypeScript types | Use existing interfaces from the workspace; check framework types first |
| Cognitive complexity | Extract nested logic into helper functions | Ensure extracted functions are testable and well-named |

### Step 5: Apply Fixes and Validate

Apply all approved fixes using the Edit tool.

**CRITICAL: Cap at ~200 LOC per PR.** If the group exceeds 200 LOC of changes:
- Split into batches by file or logical grouping
- Each batch becomes its own branch
- Inform the engineer: "This group will produce N branches of ~X LOC each."

**Validation — Hard Gate:**

After applying fixes, the validation commands **must pass before proceeding**:

```bash
VALIDATE_CMD="${SONAR_VALIDATE_COMMANDS:-npm run tsc && npm run vitest}"
eval "$VALIDATE_CMD"
```

If validation fails:
1. Read the error output
2. Diagnose whether the fix introduced the failure
3. Correct the fix
4. Re-run validation
5. Do not proceed to branch creation until validation passes

### Step 6: Create Branch and Commit (Approval 1)

**Branch** off the configured default branch:
```bash
DEFAULT_BRANCH="${SONAR_DEFAULT_BRANCH:-devel}"
git checkout -b "sonar/<rule-key>-<workspace>" "origin/${DEFAULT_BRANCH}"
```

Branch naming: `sonar/<rule-key>-<workspace>` (e.g., `sonar/S1854-awx`, `sonar/S1128-framework`)

**Commit** with a descriptive message:
```
fix: remove dead stores in AWX components (SonarCloud S1854)

Addresses 23 typescript:S1854 violations in frontend/awx/.
SonarCloud issue keys: AZxx1, AZxx2, ...
```

**CRITICAL: Pause here.** Inform the engineer:

```
Branch `sonar/S1854-awx` is ready with N commits.

You can now:
  - Review the diff: git diff origin/devel...HEAD
  - Run additional tests locally
  - Make manual adjustments and commit them to this branch

When you're satisfied, let me know and I'll create the PR.
```

**Wait for the engineer's explicit go-ahead before proceeding to PR creation.** Do NOT create the PR automatically.

### Step 7: Create PR (Approval 2)

Before creating any PRs, present a summary:

```
Ready to create PR(s):

| # | Branch                  | Files | LOC changed | Target     |
|---|-------------------------|-------|-------------|------------|
| 1 | sonar/S1854-awx         |   12  |    ~46      | devel      |
| 2 | sonar/S1854-awx-batch2  |    8  |    ~38      | devel      |

Total: 2 PR(s) targeting `devel`.

Proceed with PR creation?
```

**Wait for explicit approval.** Then for each PR:

Follow `.github/pull_request_template.md` exactly:

```markdown
## Summary

Remove N unused imports across M files in the <workspace> workspace.
Addresses SonarCloud rule `typescript:S1128` (<count> violations).

SonarCloud dashboard: https://sonarcloud.io/project/issues?id=<PROJECT_KEY>&rules=<rule>

## Type of Change

- [x] Enhancement

## Risk Analysis - REQUIRED

- [x] **Low** — Narrowly scoped (removing unused imports has no runtime effect).

## Testing

### Ephemeral E2E Tests

Once PR is ready and preliminary checks pass, trigger tests by posting a comment `${SONAR_E2E_TRIGGER_COMMENT:-/run-playwright}` on this PR.
```

Adjust **Type of Change** and **Risk Analysis** based on the fix category:
- Dead code, unused imports, commented-out code → **Low**
- Duplicate strings, unused params, type safety → **Low** to **Medium** (depending on scope)
- Cognitive complexity refactoring → **Medium**
- Security/reliability fixes → **Medium** to **High**

### Step 8: Trigger E2E and Continue

1. Post the e2e trigger comment on each newly created PR:
   ```bash
   E2E_COMMENT="${SONAR_E2E_TRIGGER_COMMENT:-/run-playwright}"
   gh pr comment <PR_NUMBER> --body "$E2E_COMMENT"
   ```
2. Offer to continue — return to group selection for the next batch

---

## Portability

This skill is designed for adoption by other teams and repos:

1. **No hardcoded values** — all project-specific config via environment variables
2. **Configurable base branch** — `SONAR_DEFAULT_BRANCH` defaults to `devel` but can be set to `main` or any branch
3. **Workspace detection is path-based** — for non-monorepo projects, issues group by top-level directory instead
4. **Validation commands** — set `SONAR_VALIDATE_COMMANDS` to your project's validation pipeline (e.g., `make lint && make test`)
5. **PR template** — adjust to match the target repo's `.github/pull_request_template.md`

### Quick Start for Other Teams

```bash
export SONAR_ORGANIZATION=your-org
export SONAR_PROJECT_KEY=your-project-key
export SONARCLOUD_TOKEN=your-token        # only for private projects
export SONAR_DEFAULT_BRANCH=main                          # if not devel
export SONAR_VALIDATE_COMMANDS="make lint && make test"    # your validation pipeline
export SONAR_E2E_TRIGGER_COMMENT="/run-e2e"                # your e2e trigger comment
```

Then use `/sonarcloud-analyze` and `/sonarcloud-fix`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "ERROR: SONAR_ORGANIZATION and SONAR_PROJECT_KEY must be set" | Missing env vars | Export `SONAR_ORGANIZATION` and `SONAR_PROJECT_KEY` |
| Empty results from API | Wrong project key or org | Verify at `https://sonarcloud.io/project/overview?id=<PROJECT_KEY>` |
| 401 from API | Private project without token | Export `SONARCLOUD_TOKEN` |
| `npm run tsc` fails after fix | Fix introduced a type error | Review the error, adjust the fix, re-run |
| `npm run vitest` fails after fix | Fix broke a test | Check if the test relied on removed code; update the test |
| Pagination missed issues | More than 500 issues per query | The skill paginates automatically; if issues are still missing, try filtering by severity or type |
