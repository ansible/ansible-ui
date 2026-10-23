# Pull Request Checklist

## Code Style

Ensure that the code adheres to the project's style guidelines. We use Prettier and ESLint for code formatting and linting.

- For code changes, run lint checks scoped to the changed files.
- Run `npm run eslint:guardrails` for changed `frontend/`, `platform/`, or
  `framework/` TypeScript files when applicable. Do not add warnings or an
  `eslint-disable` to silence new code.
- Documentation-only changes do not require application lint, type, unit, or
  Playwright checks.

## Problem Solving

Check whether the PR addresses the issue it was intended to solve.

- Review the linked issue to understand the background and context of the PR.
- Read the commit messages for a clear explanation of what has changed and why.
- Confirm the changed-file list matches the stated scope. For shared
  `framework/` work, keep product rollout and unrelated feature work in
  follow-up PRs unless splitting is unsafe.

## New Code Idioms

Evaluate whether the PR introduces new patterns or idioms to the codebase.

- Consider if the introduced idiom addresses an edge case, or if a pre-existing solution could be adapted.
- If it introduces a new idiom, make sure it is understandable and well-documented.

## Tests

Ensure that the tests cover the new changes and pass without issues, and that no regression is introduced.

- For behavior changes, verify relevant current CI and focused tests are passing
  and are thorough enough to prevent regressions. Do not run application or
  Playwright tests for documentation-only changes.
- Cover the user-visible success path plus relevant loading, error, empty, and
  permission states. For parallel requests, include an out-of-order failure /
  success case.
- Ensure the regression test fails if the fixed behavior is restored. E2E tests
  should wait for filtered or mutated data to settle and clean up test data.

## Dependencies

Assess any newly added dependencies.

- Confirm that new dependencies are necessary and justified.
- Explain intentional `package-lock.json` churn. For a temporary client-side
  workaround or dependency constraint, document its limit and the public issue
  or dependency that will remove it; do not add internal tracker links.

## PR Evidence

- Select a risk level and an applicable change type in the PR template.
- Describe the scoped automated and manual validation. Trigger `/run-playwright`
  after preliminary checks only when ephemeral E2E coverage is relevant to the
  changed behavior.
- Include before-and-after screenshots for visual changes, or explain why they
  are not applicable.
