# Claude Skill: Pull Request Review

Your goal is to review a pull request with high clarity, consistency, and alignment with the repo’s standards.

---

## 1. Load Context

Before reviewing the PR, read:

- `claude.md` (global instructions)
- Any relevant project guidelines: architecture, naming, lint, testing
- Any domain-specific instructions (e.g., React, react-hook-form, Patternfly)

**Branch Strategy:**

- Base branch: `main` (unless specified otherwise)
- Review diff: `git diff main...HEAD` or `main` → current branch
- Focus on changes introduced by the current branch, not existing code in `main`

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

- “Does this PR introduce a new pattern that already exists in the codebase?”
- “Is there duplication that should be replaced by existing helpers/modules?”
- “Is this logic available natively in a browser/Web API instead of custom code?”

Examples:

- Use URLSearchParams instead of manual query parsing
- Use structuredClone instead of manual deep copy
- Use AbortController instead of custom cancellation logic

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