# Claude Skill: SonarCloud Issue Remediation

Fetch SonarCloud issues, analyze and group them, suggest fixes, and create focused PRs with human-in-the-loop review.

---

## Setup

### Prerequisites

- **`gh`** (GitHub CLI) or **`glab`** (GitLab CLI) — one must be installed and authenticated, matching the repo's hosting platform. Used by `/sonarcloud-fix` to create PRs/MRs and post comments. The skill auto-detects the platform from the git remote URL.
- **`python3`** (3.8+) — used by the fetch script (`scripts/sonarcloud-fetch.py`). Uses only Python stdlib (no external dependencies).

### Environment Variables

All variables can be set as environment variables beforehand **or** provided interactively when the skill starts. Interactive prompting avoids requiring engineers to exit the session to configure the environment.

| Variable | When needed | Purpose |
|----------|-------------|---------|
| `SONAR_BASE_URL` | Phase A, B (optional) | Base URL of the Sonar API. Defaults to `https://sonarcloud.io/api`. Set this to target a self-hosted SonarQube instance (e.g. `https://sonarqube.corp.redhat.com/api`). |
| `SONAR_ORGANIZATION` | Phase A, B | SonarCloud organization slug. **Required for SonarCloud; optional for self-hosted SonarQube.** |
| `SONAR_PROJECT_KEY` | Phase A, B | Sonar project key |
| `SONARCLOUD_TOKEN` | Private projects only | API authentication token. **Must be set as an environment variable before starting Claude** — the skill will never prompt for or handle this value directly. Works with both SonarCloud and SonarQube tokens. |
| `SONAR_DEFAULT_BRANCH` | Phase B | Base branch for fix PRs (e.g. `main`, `devel`) |
| `SONAR_VALIDATE_COMMANDS` | Phase B | Validation commands that must pass before PR creation (e.g. `npm run tsc && npm run vitest`) |
| `SONAR_PR_COMMENT` | Phase B (optional) | Comment to post automatically on each newly created PR/MR. Commonly used to trigger CI workflows (e.g. `/run-playwright`). If not provided, no comment is posted. Set to `none`, `skip`, `false`, or empty string `""` to explicitly disable. |

---

## Phase A — Analyze

Invoked via `/sonarcloud-analyze`. Fetches all open issues and presents a prioritized, grouped report.

### Step 0: Collect Configuration

Before fetching data, detect the hosting platform and collect required variables.

**Step 0a: Detect hosting platform**

Read the git remote URL to determine whether this is a GitHub or GitLab repository:

```bash
git remote get-url origin
```

- If the URL contains `github.com` → **GitHub** (use `gh` CLI)
- If the URL contains `gitlab` → **GitLab** (use `glab` CLI)
- If unclear, ask the engineer: "Is this repo hosted on GitHub or GitLab?"

Store the detected platform for use in Phase B.

**Step 0b: Collect SonarCloud variables**

Check whether the required variables are available as environment variables. For any that are missing, prompt the engineer interactively using AskUserQuestion.

1. If `SONAR_ORGANIZATION` is not set and the target is SonarCloud (no `SONAR_BASE_URL` override), ask: "What is your SonarCloud organization slug?" For self-hosted SonarQube instances, `SONAR_ORGANIZATION` is optional — skip this prompt.
2. If `SONAR_PROJECT_KEY` is not set, ask: "What is your Sonar project key?"
3. If `SONARCLOUD_TOKEN` is not set and the project is private, **do not prompt for the token**. Instead, guide the engineer to set it up themselves and restart Claude:
   > "This project requires a `SONARCLOUD_TOKEN` for API access. Please set it as an environment variable and restart Claude:
   >
   > ```bash
   > export SONARCLOUD_TOKEN=<your-token>
   > ```
   >
   > You can generate a token at your Sonar instance's account security page (e.g. https://sonarcloud.io/account/security for SonarCloud). Once the variable is set, restart Claude and re-run the command."

   Then **stop the workflow** — do not proceed without the token in the environment.

After collecting the required values, also remind the engineer: "If you plan to fix issues after analysis, I'll need a few more values later — the base branch name and your validation commands. You can provide them now or when we get to the fix phase."

If the engineer provides Phase B values at this point (`SONAR_DEFAULT_BRANCH`, `SONAR_VALIDATE_COMMANDS`, `SONAR_PR_COMMENT`), store them for later use and skip re-prompting in Phase B Step 0.

Use the collected values for the remainder of the session.

### Step 1: Fetch and Categorize Issues

Run the fetch script to retrieve all SonarCloud data. If `SONAR_ORGANIZATION` or `SONAR_PROJECT_KEY` were provided interactively (not via environment variables), pass them as inline environment variables. **Never pass `SONARCLOUD_TOKEN` on the command line** — it must already be in the environment.

```bash
SONAR_PROJECT_KEY=<value> SONAR_ORGANIZATION=<value> python3 .claude/skills/sonarcloud-remediation/scripts/sonarcloud-fetch.py
```

If all values are already set as environment variables, run the script directly:

```bash
python3 .claude/skills/sonarcloud-remediation/scripts/sonarcloud-fetch.py
```

The script handles pagination, authentication, and categorization automatically. It outputs JSON to stdout with this structure:

- `project_key` — the project key used
- `fetched_at` — ISO timestamp of when data was fetched
- `issues.total` — total issue count
- `issues.items[]` — array of issues, each with: `key`, `component` (relative file path), `type` (BUG/VULNERABILITY/CODE_SMELL), `severity`, `line`, `message`, `rule`
- `hotspots.total` — total hotspot count
- `hotspots.items[]` — array of hotspots, each with: `key`, `component`, `securityCategory`, `vulnerabilityProbability`, `line`, `message`, `rule`, `status`
- `duplication` — object with `duplicated_lines_density`, `duplicated_blocks`, `duplicated_files`
- `categories` — pre-grouped object with keys: `Security`, `Reliability`, `Maintainability`, `Security Hotspots`, `Duplication`

If the script exits with code 1, read the `error` field from its JSON output and display the error message to the user. Common errors:
- Missing env vars → prompt the user to set them
- HTTP 401 → invalid token
- HTTP 404 → wrong project key
- `"hint": "missing_organization"` → the Sonar instance requires an organization. Prompt the user: "This Sonar instance requires an organization. What is your Sonar organization slug?" Then re-run the fetch script with `SONAR_ORGANIZATION` set to the provided value.

Parse the JSON output. Use the `categories` object as the starting point for Step 2.

### Step 2: Group by Rule + Module

Within each category, group issues by **SonarCloud rule key** and **module** (workspace, package, or top-level directory depending on the repo structure).

#### Detecting Modules

Determine the repo's module structure **once at the start of analysis**, then apply it consistently to all issues.

**Step 2a: Check for monorepo workspace definitions**

Look for workspace/package definitions in this order:

1. **`package.json` `workspaces`** — NPM/Yarn workspaces (array of glob patterns like `["frontend/*", "framework"]`)
2. **`pnpm-workspace.yaml`** — pnpm workspaces (`packages:` list)
3. **`nx.json`** or `workspace.json` — Nx monorepo
4. **`lerna.json`** — Lerna monorepo (`packages` list)

If any of these exist, resolve the workspace patterns to actual directories. Map each issue's `component` file path to the workspace whose path prefix matches. Use the workspace directory name (or a human-friendly label derived from it) as the module name.

Example: if `package.json` has `"workspaces": ["frontend/*", "framework"]`, then:
- `frontend/awx/src/Foo.tsx` → module `frontend/awx`
- `framework/PageTable.tsx` → module `framework`
- `scripts/build.js` → module `root`

**Step 2b: No workspace definitions found (non-monorepo)**

Group issues by their **top-level directory** from the `component` field (the first path segment after the project key). Files in the repo root go into a `root` group.

Example:
- `src/api/handler.ts` → module `src`
- `lib/utils.ts` → module `lib`
- `tests/unit/foo.test.ts` → module `tests`
- `README.md` → module `root`

#### Group Identifier

Each group is identified as: `<rule key> — <module>` (e.g., `typescript:S1854 — frontend/awx`, `python:S1481 — src`).

### Step 3: Sort by Remediation Priority

Within each category, sort groups by this priority order. Match by rule ID suffix (the numeric part is language-agnostic in SonarCloud — e.g., `S1128` appears as `typescript:S1128`, `python:S1128`, `java:S1128`, etc.):

1. Unused imports and variables (`S1128`, `S1481`, `S1144`)
2. Dead code / dead stores (`S1854`, `S1186`, `S1068`)
3. Duplicate string literals (`S1192`)
4. Unused function parameters (`S1172`)
5. Commented-out code (`S125`)
6. Simple type safety improvements (`S4325`, `S4204`, `S1874`)
7. Cognitive complexity (`S3776`)
8. Security hotspot rules
9. Reliability / bug rules
10. All other rules

Rules not matching any priority bucket sort to the end, ordered by issue count descending.

### Step 4: Estimate LOC Impact

For each group, estimate the lines of code that will change:
- Unused imports: ~1 LOC per issue (removal)
- Dead stores: ~1-2 LOC per issue
- Duplicate strings: ~2-3 LOC per issue (extract to const + references)
- Unused parameters: ~1 LOC per issue
- Commented-out code: variable, count the commented lines from issue details
- Type safety: ~1-3 LOC per issue
- Cognitive complexity: ~10-20 LOC per issue (refactoring)

### Step 5: Present Summary Table

Display one table per category. Include total issue count in the heading.

**CRITICAL: Use a single continuous numbering sequence across all categories.** The group `#` is the ID that `/sonarcloud-fix` uses to select groups. It must be globally unique, not reset per category. All rows — including security hotspots — must use the same table format with the rule or category identifier in parentheses.

```
## Maintainability (847 issues)

| # | Group                              | Module          | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------------|-------|----------|----------|-----------|
| 1 | Unused imports (typescript:S1128)   | frontend/awx    |   45  | Minor    |   ~45    |           |
| 2 | Dead stores (typescript:S1854)      | frontend/awx    |   23  | Major    |   ~35    |           |
| 3 | Duplicate strings (typescript:S1192)| framework       |   12  | Minor    |   ~36    |           |
| 4 | Cognitive complexity (typescript:S3776) | frontend/hub|   8   | Critical |  ~120    | Will split |
...

## Reliability (42 issues)

| # | Group                              | Module          | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------------|-------|----------|----------|-----------|
| 5 | Constant nullishness (typescript:S6638) | frontend/awx|   2   | Major    |    ~4    |           |
...

## Security (5 issues)

| # | Group                              | Module          | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------------|-------|----------|----------|-----------|
| 8 | SQL injection (typescript:S2077)    | frontend/hub   |   1   | Blocker  |    ~5    |           |
...

## Security Hotspots (18 issues)

| # | Group                              | Module          | Count | Severity | Est. LOC | Note      |
|---|------------------------------------|-----------------|-------|----------|----------|-----------|
|11 | Weak cryptography (weak-cryptography) | frontend/awx |   3   | Medium   |    ~6    |           |
|12 | Data encryption (encrypt-data)     | frontend/awx    |   1   | Low      |    ~2    |           |
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

**Tip:** If you plan to fix issues after analysis, it's best to have `SONAR_DEFAULT_BRANCH` and `SONAR_VALIDATE_COMMANDS` ready. You can set them as environment variables beforehand, or provide them interactively when Phase B starts.

### Optional Filters

If the user provides flags, apply them before grouping:

- `--severity <BLOCKER|CRITICAL|MAJOR|MINOR|INFO>` — only show issues at or above this severity
- `--module <name>` — only show issues in the specified module

---

## Phase B — Fix

Invoked via `/sonarcloud-fix`. The engineer selects groups from the analyze output and the skill applies fixes with approval.

### Step 0: Configuration Pre-Check

**Before doing any work**, check all required Phase B configuration. If any variables are missing and were not already provided during Phase A Step 0, prompt the engineer interactively using AskUserQuestion.

**Step 0a: Collect missing Phase B variables**

If `SONAR_DEFAULT_BRANCH` is not set (env var or earlier prompt), ask:
> "What is the base branch for fix PRs? (e.g. `main`, `devel`)"

If `SONAR_VALIDATE_COMMANDS` is not set (env var or earlier prompt), ask:
> "What validation commands must pass before a PR can be created? (e.g. `npm run tsc && npm run vitest`, `make lint && make test`)"

If `SONAR_PR_COMMENT` is not set (env var or earlier prompt), ask:
> "Do you want a comment posted automatically on each PR/MR? This is commonly used to trigger CI workflows (e.g. `/run-playwright`). Provide the comment text, or type 'skip' to disable."

Use the values provided for the remainder of the session.

**Step 0b: Display configuration summary**

Display all non-sensitive configuration values so the engineer can verify them:

```
## Configuration

| Variable                  | Value                          | Source      | Description                                        |
|---------------------------|--------------------------------|-------------|----------------------------------------------------|
| SONAR_ORGANIZATION        | your-org                       | env         | SonarCloud organization slug                       |
| SONAR_PROJECT_KEY         | your-project-key               | env         | SonarCloud project key                             |
| SONARCLOUD_TOKEN          | (set)                          | env         | API token for private projects                     |
| SONAR_DEFAULT_BRANCH      | main                           | interactive | Branch that fix PRs will target                    |
| SONAR_VALIDATE_COMMANDS   | make lint && make test         | interactive | Commands that must pass before a PR can be created |
| SONAR_PR_COMMENT          | /run-playwright                | env         | Comment posted automatically on each PR/MR         |
```

- Show `(set)` or `(not set)` for `SONARCLOUD_TOKEN` — never display the actual value. This variable is always sourced from the environment (never interactive).
- In the Source column, show `env` if from an environment variable or `interactive` if provided via prompt
- If `SONAR_PR_COMMENT` was skipped or not provided, show `(not set — no comment will be posted)` in the Value column
- If `SONAR_PR_COMMENT` is set to `none`, `skip`, `false`, or an empty string, show `(disabled)` in the Value column

Then ask: "Do these settings look correct? If any need updating, let me know."

- If the engineer confirms → proceed to Step 1
- If the engineer wants to change a value → prompt for the new value and update the session configuration

**Skip this pre-check** if it was already confirmed earlier in the same session.

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
## Group: Unused imports (typescript:S1128) — frontend/awx (45 issues)

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

### Fix Strategies by Rule Pattern

These strategies apply across languages. Adapt to the project's language and conventions.

| Rule Pattern | Fix Strategy | Caution |
|---|---|---|
| Unused imports | Remove the import/include/require line | Check for side-effect imports (e.g., CSS imports, polyfills, module-level init) — do not remove those |
| Dead stores | Remove the unused assignment | Check for intentional destructuring or unpacking patterns |
| Duplicate strings | Extract to a named constant at the top of the file or a shared constants module | Use descriptive names; check if a shared constant already exists in the project |
| Unused function parameters | Remove if internal function; prefix with `_` if required by an interface, override, or callback signature | Verify the function isn't part of a public API or framework contract |
| Commented-out code | Delete entirely | Git history preserves it; no need to keep |
| Type safety (e.g., `any` in TypeScript, raw types in Java) | Replace with proper types using existing project type definitions | Check for existing types/interfaces in the project before creating new ones |
| Cognitive complexity | Extract nested logic into helper functions | Ensure extracted functions are testable and well-named |

### Step 5: Apply Fixes and Validate

Apply all approved fixes using the Edit tool.

**CRITICAL: Cap at ~200 LOC per PR.** If the group exceeds 200 LOC of changes:
- Split into batches by file or logical grouping
- Each batch becomes its own branch
- Inform the engineer: "This group will produce N branches of ~X LOC each."

**Validation — Hard Gate:**

After applying fixes, run the validation commands using the value from the environment variable or the value provided interactively in Step 0.

```bash
eval "$SONAR_VALIDATE_COMMANDS"
```

If validation fails:
1. Read the error output
2. Diagnose whether the fix introduced the failure
3. Correct the fix
4. Re-run validation
5. Do not proceed to branch creation until validation passes

### Step 6: Create Branch and Commit (Approval 1)

**Branch** off the configured default branch, using the value from the environment variable or the value provided interactively in Step 0.

```bash
git checkout -b "sonar/<rule-key>-<module-slug>" "origin/$SONAR_DEFAULT_BRANCH"
```

Branch naming: `sonar/<rule-key>-<module-slug>` where `<module-slug>` is the module name with `/` replaced by `-` (e.g., `sonar/S1854-frontend-awx`, `sonar/S1128-framework`, `sonar/S1481-src`)

**Commit** with a descriptive message:
```
fix: remove dead stores in frontend/awx (SonarCloud S1854)

Addresses 23 typescript:S1854 violations in frontend/awx/.
SonarCloud issue keys: AZxx1, AZxx2, ...
```

**CRITICAL: Pause here.** Inform the engineer:

```
Branch `sonar/S1854-frontend-awx` is ready with N commits.

You can now:
  - Review the diff: git diff origin/<SONAR_DEFAULT_BRANCH>...HEAD
  - Run additional tests locally
  - Make manual adjustments and commit them to this branch

When you're satisfied, let me know and I'll create the PR.
```

**Wait for the engineer's explicit go-ahead before proceeding to PR creation.** Do NOT create the PR automatically.

### Step 7: Create PR/MR (Approval 2)

Before creating any PRs/MRs, present a summary:

```
Ready to create PR(s)/MR(s):

| # | Branch                          | Files | LOC changed | Target              |
|---|-------------------------------|-------|-------------|---------------------|
| 1 | sonar/S1854-frontend-awx        |   12  |    ~46      | <SONAR_DEFAULT_BRANCH> |
| 2 | sonar/S1854-frontend-awx-batch2 |    8  |    ~38      | <SONAR_DEFAULT_BRANCH> |

Total: 2 PR(s)/MR(s) targeting `<SONAR_DEFAULT_BRANCH>`.

Proceed?
```

**Wait for explicit approval.** Then for each PR/MR:

**Title — REQUIRED format:**

All titles **must** start with the prefix `SonarCloud Fix:` followed by a short description of the issue area being addressed. Use this pattern:

```
SonarCloud Fix: <brief description of fix> (<rule key>, <module>)
```

Examples:
- `SonarCloud Fix: Remove unused imports (S1128, frontend/awx)`
- `SonarCloud Fix: Remove dead stores (S1854, framework)`
- `SonarCloud Fix: Extract duplicate string literals (S1192, frontend/hub)`
- `SonarCloud Fix: Reduce cognitive complexity (S3776, frontend/eda)`
- `SonarCloud Fix: Remove commented-out code (S125, src)`

For batched PRs/MRs, append the batch number:
- `SonarCloud Fix: Remove dead stores (S1854, frontend/awx) [batch 1/2]`

**Creating the PR/MR:**

Use the platform detected in Phase A Step 0:

- **GitHub**: `gh pr create --title "<title>" --body "<body>" --base <SONAR_DEFAULT_BRANCH>`
- **GitLab**: `glab mr create --title "<title>" --description "<body>" --target-branch <SONAR_DEFAULT_BRANCH>`

**Body/description:** If the repo has a PR/MR template (`.github/pull_request_template.md` or `.gitlab/merge_request_templates/`), follow its structure. Otherwise, use this default format:

```markdown
## Summary

Remove N unused imports across M files in the <module> module.
Addresses SonarCloud rule `<language>:S1128` (<count> violations).

SonarCloud dashboard: https://sonarcloud.io/project/issues?id=<PROJECT_KEY>&rules=<rule>

## Type of Change

- [x] Enhancement

## Risk Analysis

- [x] **Low** — Narrowly scoped (removing unused imports has no runtime effect).

## Testing

Validation passed: `<SONAR_VALIDATE_COMMANDS>`.
```

Adjust **Type of Change** and **Risk Analysis** based on the fix category:
- Dead code, unused imports, commented-out code → **Low**
- Duplicate strings, unused params, type safety → **Low** to **Medium** (depending on scope)
- Cognitive complexity refactoring → **Medium**
- Security/reliability fixes → **Medium** to **High**

### Step 8: Post PR/MR Comment and Continue

1. Check `SONAR_PR_COMMENT`. If the variable is **not set**, **skip** this step entirely. If set to `none`, `skip`, `false`, or an empty string `""`, also **skip**. Otherwise, post the comment on each newly created PR/MR using the detected platform:
   - **GitHub**: `gh pr comment <PR_NUMBER> --body "$SONAR_PR_COMMENT"`
   - **GitLab**: `glab mr note <MR_NUMBER> --message "$SONAR_PR_COMMENT"`
2. Offer to continue — return to group selection for the next batch

---

## Portability

This skill is designed for adoption across repositories:

1. **No hardcoded values** — all project-specific config via environment variables or interactive prompts
2. **SonarCloud and SonarQube** — works with SonarCloud (default) and self-hosted SonarQube instances via `SONAR_BASE_URL`. Organization parameter is automatically omitted for self-hosted instances where it is not required.
3. **Configurable base branch** — `SONAR_DEFAULT_BRANCH` set via env var or provided interactively
4. **Automatic module detection** — detects monorepo workspaces from `package.json`, `pnpm-workspace.yaml`, `nx.json`, or `lerna.json`. For non-monorepo projects, groups issues by top-level directory. No repo-specific configuration required.
5. **Fetch script** — `scripts/sonarcloud-fetch.py` uses only Python stdlib (no external dependencies). Handles pagination, authentication, and categorization deterministically.
6. **Validation commands** — `SONAR_VALIDATE_COMMANDS` set via env var or provided interactively
7. **GitHub and GitLab** — auto-detects hosting platform from git remote URL; uses `gh` or `glab` accordingly
8. **PR/MR template** — automatically adapts to the target repo's `.github/pull_request_template.md` or `.gitlab/merge_request_templates/`

### Quick Start for Other Teams

```bash
export SONAR_ORGANIZATION=your-org
export SONAR_PROJECT_KEY=your-project-key
export SONARCLOUD_TOKEN=your-token        # only for private projects
export SONAR_BASE_URL=https://sonarqube.corp.example.com/api  # only for self-hosted SonarQube
export SONAR_DEFAULT_BRANCH=main                          # if not devel
export SONAR_VALIDATE_COMMANDS="make lint && make test"    # your validation pipeline
export SONAR_PR_COMMENT="/run-e2e"                         # your PR comment, or "none" to disable
```

Then use `/sonarcloud-analyze` and `/sonarcloud-fix`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Prompted for organization/project key | Not set as env vars | Set env vars beforehand, or provide values when prompted interactively |
| Empty results from API | Wrong project key or org | Verify the project exists on your Sonar instance (e.g. `https://sonarcloud.io/project/overview?id=<PROJECT_KEY>` for SonarCloud, or `<SONAR_BASE_URL>/dashboard?id=<PROJECT_KEY>` for self-hosted) |
| 401 from API | Private project without token | Set `SONARCLOUD_TOKEN` as an environment variable (`export SONARCLOUD_TOKEN=<your-token>`), then restart Claude. Generate a token from your Sonar instance's account security page |
| Connection error to self-hosted instance | Wrong URL or TLS issue | Verify `SONAR_BASE_URL` is correct (include `/api` suffix). For self-signed certificates, set `SONAR_INSECURE=1` |
| Prompted for Phase B config | Not set as env vars | Set env vars beforehand, or provide values when prompted. You can also provide Phase B values during Phase A to avoid a second prompt. |
| Validation command fails after fix | Fix introduced a build/lint/type error | Review the error, adjust the fix, re-run `SONAR_VALIDATE_COMMANDS` |
| Tests fail after fix | Fix broke a test | Check if the test relied on removed code; update the test and re-run validation |
| Pagination missed issues | More than 500 issues per query | The skill paginates automatically; if issues are still missing, try filtering by severity or type |
