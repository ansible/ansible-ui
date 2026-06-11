# Claude Skill: Pull Request Review

Your goal is to review a pull request with high clarity, consistency, and alignment with the repo’s standards.

---

## 1. Load Context

Before reviewing the PR, read:

- `claude.md` (global instructions)
- Any relevant project guidelines: architecture, naming, lint, testing
- Any domain-specific instructions (e.g., React, react-hook-form, Patternfly)

**Branch Strategy:**

- Base branch: `devel` (unless specified otherwise)
- Review diff: `git diff devel...HEAD` or `devel` → current branch
- Focus on changes introduced by the current branch, not existing code in `devel`

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

| Pattern Detected                      | Required Action                                       |
| ------------------------------------- | ----------------------------------------------------- |
| **Repeated JSX structure** (2+ times) | → Extract to component in `/framework` or workspace   |
| **Repeated logic/state** (2+ times)   | → Extract to custom hook                              |
| **Repeated utility functions**        | → Move to `/frontend/common`                          |
| **Similar components with variants**  | → Consolidate into single component with props        |

**Where to extract:**

- **Extract to `/framework`**: Used across 2+ workspaces, domain-agnostic
- **Extract to `/frontend/common`**: Shared utilities, hooks, or types
- **Keep in workspace**: Service-specific logic (AWX-only, EDA-only, Hub-only)

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

Generate a list of missing tests and suggested improvements.

---

## 6. Explain the Changes Back (for Documentation)

Generate a markdown summary file that explains:

- What the PR does
- Why the changes matter
- Visual diagrams when relevant
- Before/After examples
- Known tradeoffs
- Any follow-up tasks recommended

---

## 7. Validation Commands

Run these project commands:

```bash
npm run prettier                  # Formatting
cd platform && npm run eslint # Linting
cd platform && npm run tsc    # Type check
```

Then ask the user to confirm manually:

- UI works in the browser
- Forms, navigation, and modals behave as expected
- No console errors appear

---

## 8. Final Deliverables

Output should include:

1. A structured PR review
2. A list of issues to fix
3. Recommendations for simplification
4. Test coverage guidance
5. A proposed `.md` explanation file for the PR