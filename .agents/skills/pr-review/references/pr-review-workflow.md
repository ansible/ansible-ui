# Pull Request Review

Your goal is to review a pull request with high clarity, consistency, and alignment with the repo’s standards.

---

## 1. Load Context

Before reviewing the PR, read:

- `AGENTS.md` trigger table, then the matching skills (not the whole skill set)
- `.agents/skills/frontend-overlay/SKILL.md` for wrappers and API helpers
- Any domain-specific skill: coding-standards, testing-guidelines

**Branch Strategy:**

- Base branch: `devel` (unless specified otherwise)
- Review diff: `git diff devel...HEAD` or `devel` → current branch
- Focus on changes introduced by the current branch, not existing code in `devel`

### Identify PR Scope (CRITICAL)

Review only what the PR changes. Getting the scope wrong wastes effort and
produces misleading feedback.

- When GitHub CLI is available, start with `gh pr view <N> --json
  title,body,additions,deletions,baseRefName,headRefName` and
  `gh api "repos/OWNER/REPO/pulls/<N>/files" --paginate --jq '.[].filename'`.
  Then use `git diff --stat devel...HEAD` and scoped `git diff` hunks for the
  detailed review. Confirm the file list matches what the PR claims to change.
- Use three-dot `devel...HEAD` so you see only this branch's changes, not
  unrelated commits that landed on `devel` after it forked.
- When the diff is large or surprising, confirm scope with the author before
  reviewing line-by-line.

| Pitfall                              | Avoid by                                   |
| ------------------------------------ | ------------------------------------------ |
| Reviewing files the PR never touched | Diff the exact range; don't browse `devel` |
| Stale diff after a rebase/force-push | `git fetch` and re-diff before commenting  |
| Two-dot vs three-dot confusion       | Use `devel...HEAD` to isolate the branch   |

---

## 2. Validate Against Guidelines

Check whether the changes follow:

- Existing code patterns
- Repo naming conventions
- Architecture and design principles
- Error-handling standards
- Test strategy
- Security expectations
- Performance constraints

**Project-Specific:**

- Components in correct package (platform vs framework)
- No over-engineering (avoid premature abstractions, unnecessary error handling)
- **No new `eslint:guardrails` warnings** on changed `frontend/` /
  `platform/` / `framework/` `.ts`/`.tsx` (see §7). The CI job is advisory
  (`continue-on-error`), but a warning-count increase vs the base branch is a
  **review blocker**. Ask to split or flatten.
- **No new ESLint suppressions** (`eslint-disable`, `eslint-disable-next-line`,
  `eslint-disable-line`, file-level `/* eslint-disable */`). Review blocker;
  fix the rule instead of silencing it (see §7).
- **Shared framework scope:** When a PR changes `framework/`, treat unrelated
  feature work or product rollout changes in the same PR as a **review
  blocker**. Require a dedicated, independently reversible framework PR and
  follow-up adoption PRs unless the author gives a concrete reason splitting is
  unsafe. Require complete relevant framework tests and representative
  validation of affected consuming workspaces, and require the PR description
  to document compatibility impact before approval.

### Internationalization Safety Check

- Translate static UI copy, but render dynamic or user-provided strings directly.
- Do not pass API values such as names, labels, descriptions, or survey question text to `t()`; punctuation such as `:` can be interpreted as an i18next namespace separator.
- Do not use translated strings for logic or comparisons; use raw API values, IDs, enums, or routes.
- When removing translation from a dynamic value, keep nearby static UI text translated and add a regression test for punctuation-sensitive input.

---

## 3. Detect Re-invented Patterns

Ask:

- "Does this PR introduce a new pattern that already exists in the codebase?"
- "Is there duplication that should be replaced by existing helpers/modules?"
- "Is this logic available natively in a browser/Web API instead of custom code?"

Examples:

- Use URLSearchParams instead of manual query parsing
- Use structuredClone instead of manual deep copy
- Use AbortController instead of custom cancellation logic

### AAP-Specific Component & Abstraction Review

When reviewing new components or logic, ask these critical questions:

#### 1. Component Reuse Check

**"Have I seen this JSX pattern before?"**

- ✅ Check `/framework` for similar patterns (PageForm, PageTable, PageHeader, PageLayout, etc.)
- ✅ Check PatternFly 6 documentation for existing components
- ✅ Search workspace components (`/frontend/awx/`, `/frontend/eda/`, `/frontend/hub/`)
- ❌ **Flag if**: New component recreates existing framework or PF6 functionality

**Examples:**

- Creating a custom table → Should use PageTable from `/framework`
- Creating a custom modal → Should use PatternFly Modal
- Creating a custom empty state → Check if framework has a reusable pattern

#### 2. Logic Reusability Check

**"Is this logic reusable across workspaces?"**

- ✅ Would AWX, EDA, and Hub benefit from this logic?
- ✅ Check if a hook already exists in `/framework` or `/frontend/common/hooks/`
- ✅ Look for repeated useState/useEffect patterns
- ❌ **Flag if**: Logic is duplicated from another workspace or could be shared

**Examples:**

- Table selection logic → Should be extracted to hook like `useTableSelection`
- Form validation patterns → Should be in `/frontend/common/hooks/`
- RBAC permission checks → Should be shared utility

#### 3. Component Extension vs Creation

**"Can I extend an existing component instead of creating new?"**

- ✅ Does PageTable/PageForm/PageHeader already support this with props?
- ✅ Can a PatternFly variant or modifier solve this?
- ✅ Can I add a prop instead of forking the component?
- ❌ **Flag if**: PR creates new component when existing one could be extended

**Examples:**

- Need table with custom toolbar → Extend PageTable with toolbar prop
- Need form with different layout → Use PageForm with layout variants
- Need button with icon → Use PatternFly Button with icon prop

#### 4. Code Duplication Patterns

**Flag these patterns for extraction:**

| Pattern Detected                      | Required Action                                     |
| ------------------------------------- | --------------------------------------------------- |
| **Repeated JSX structure** (2+ times) | → Extract to component in `/framework` or workspace |
| **Repeated logic/state** (2+ times)   | → Extract to custom hook                            |
| **Repeated utility functions**        | → Move to `/frontend/common`                        |
| **Similar components with variants**  | → Consolidate into single component with props      |

**Where to extract:**

- **Extract to `/framework`**: Used across 2+ workspaces, domain-agnostic
- **Extract to `/frontend/common`**: Shared utilities, hooks, or types
- **Keep in workspace**: Service-specific logic (AWX-only, EDA-only, Hub-only)

### Rule Bypass Checks

New code should not silence the tooling instead of fixing the problem. Grep the
diff (`git diff devel...HEAD`) for each of these and review every hit in added
lines:

| Pattern                                       | Review expectation               | Ask for instead                                                          |
| --------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| `eslint-disable` / `eslint-disable-next-line` / `eslint-disable-line` | **Review blocker** — new suppression | Fix the underlying issue; never silence guardrails or required rules |
| `@ts-ignore` / `@ts-expect-error`             | Require narrow justification     | Correct the types where possible; document exceptional cases             |
| `TODO` / `FIXME` / `HACK` / `XXX`             | Must not hide unfinished work    | Resolve, or file a tracked issue                                         |
| Custom deep copy / query parsing / UUID       | Avoid re-inventing platform APIs | Native API (`structuredClone` / `URLSearchParams` / `crypto.randomUUID`) |

Recipe: `git diff devel...HEAD | rg '^\+' | rg 'eslint-disable|@ts-(ignore|expect-error)|TODO|FIXME|HACK|XXX'`

### HTML → PatternFly 6 Component Mapping

Review UI choices in this order: existing framework wrapper, PF6 component,
semantic native HTML when no suitable component abstraction exists, then a
custom component only as a documented last resort. Typical mappings:

| Raw HTML          | Use       |
| ----------------- | --------- |
| `<button>`        | `Button`  |
| `<p>` / free text | `Content` |
| `<ul>` / `<ol>`   | `List`    |
| `<h1>`…`<h6>`     | `Title`   |

Keep `<span>`, `<code>`, and `<div>` where a semantic PF component does not apply.

---

## 4. Recommend Simpler / Native Alternatives

If the PR implements a complex custom solution, propose:

- A built-in method
- A standard library replacement
- A repo-wide helper function

---

## 5. Evaluate Test Coverage

Check whether:

- The PR includes tests for critical logic
- Tests follow existing patterns
- Edge cases are covered
- The behavior is stable across browsers/devices
- The test names clearly describe intent
- E2E tests validate the full flow when needed
- Async code covers loading, success, error, and empty states. For parallel
  requests, include the out-of-order failure/success sequence so an early
  error cannot replace a still-pending successful path.
- A regression test would fail if the behavior being fixed were restored; a
  test that merely passes is not sufficient.
- Live E2E waits for post-filter or post-mutation data to settle and cleans up
  resources in `try/finally` or the established suite helper.

For behavior-changing PRs, list missing regression coverage and focused test
improvements. Skip test recommendations when they do not apply to the diff.

---

## 6. Summarize When It Helps

When the PR description is unclear or the change needs a handoff, provide a
concise summary of what changed, why it matters, relevant tradeoffs, and any
follow-up work. Create a separate Markdown document only when the change itself
requires durable documentation; do not create one as a routine review deliverable.

---

## 7. CI and Focused Validation

Review current-head CI evidence first. Do not repeat checks that already passed.
If a relevant check is missing or failed, select a focused check that covers the
changed behavior and report its result.

Match validation to the diff:

- **Documentation-only changes:** use a Markdown or link check if the repository
  provides one. Application lint, type checks, unit tests, and Playwright are
  not required when no application behavior changed.
- **Code changes:** use checks scoped to changed paths. Review guardrail warnings
  on changed TypeScript files against the base branch when CI does not provide
  that comparison; do not accept added warnings or new ESLint suppressions.
- **Browser behavior:** use Playwright or manual browser validation only when the
  change affects a user flow and current CI does not already provide sufficient
  evidence. Do not trigger E2E for unrelated or documentation-only changes.

If relevant CI evidence is incomplete, state that clearly rather than assuming
success or running an unrelated suite. Ask for manual confirmation only when a
behavior cannot be verified from available tests or evidence.

---

## 8. Review Output

Put actionable findings first. Each finding should include a severity, file and
line, concrete impact, and a concise explanation. Separate required fixes from
optional suggestions. If there are no findings, say so and summarize the
reviewed scope. Report only relevant CI and focused validation evidence; do not
require a separate Markdown summary file for every PR.

---

## 9. Independent Re-check

For complex or high-risk changes, use a second independent reviewer when one is
available. Do not prime that reviewer with the first review's findings. Compare
the results for concrete evidence, clear impact, correct severity, and
actionable wording. For small documentation-only changes, a careful self-review
against the diff and source documents is sufficient.

---

## 10. CI, ESLint, and shared agent-guidance PRs

Extra checks when the diff touches `.github/workflows/`, eslint config, or
`.agents/skills/`:

| Area | Review for |
| --- | --- |
| GitHub Actions | Third-party actions pinned to **full SHAs** or immutable versions; treat workflow edits as security-sensitive. |
| ESLint | Prefer **flat config** (`eslint.config.mjs`). Avoid new parallel `.eslintrc.*` unless there is a documented reason (e.g. isolated guardrails). |
| Agent skills | Keep guidance provider-neutral and public-safe. Use one shared source of truth; tool-specific files should be thin adapters. Point to **`framework/`** for shared components; cite versions from **`package.json`** / **`.nvmrc`**, not memory. Prefer documenting bans via **ESLint** (or cite an existing rule) over long prose. |
| Lockfile | Intentional `package-lock.json` churn should be obvious in the PR description. |

## 11. Updating Review Guidance from PR Feedback

When refreshing repository review guidance from recent pull request feedback:

- Use the complete review window requested for the update, including submitted
  reviews and inline review comments. Record the exact date range.
- Include only human-authored feedback. Exclude GitHub accounts marked as bots,
  known chatbot or AI-review accounts, and comments disclosed as AI-generated
  or AI-assisted. If authorship is uncertain, do not use the comment as a source.
- Preserve every distinct, actionable human observation. Deduplicate repeated
  advice, but do not drop a finding just because it appears only once.
- Check each proposed rule against current repository practice or authoritative
  documentation before adding it. Keep rules general enough to help future
  reviews; do not copy comments or reviewer names into the skill.
- State the source window and human-only filtering in the PR description so the
  review-guidance update can be audited.
