## Summary

<!-- What changed and why? -->

## Type of Change

- [ ] Bug fix
- [ ] Enhancement
- [ ] Tests
- [ ] Documentation
- [ ] Other (please specify)

## Risk Analysis - REQUIRED

<!-- SELECT ONE. This is required — the PR check will fail if none is selected. -->

- [ ] **High** — Broad platform impact (e.g., SWR config, shared framework components, authentication, routing, API wrappers, build/bundler config). Changes affect multiple workspaces or could cause widespread regressions.
- [ ] **Medium** — Scoped but cross-cutting (e.g., shared utility functions, changes to multiple pages within one workspace, component library updates, test infrastructure). Limited blast radius but touches common code paths.
- [ ] **Low** — Narrowly scoped (e.g., single page fix, styling tweak, documentation, test-only changes, copy/string updates). Minimal risk of unintended side effects.

## Shared Framework Scope

- [ ] This PR does not mix shared `framework/` changes with unrelated feature work or product rollout changes. If it does, split the work into a dedicated framework PR and follow-up PRs, or explain why splitting is not feasible.
- [ ] If this PR changes `framework/`, it includes complete relevant framework test coverage and representative validation of affected consuming workspaces.

## Dependencies

<!-- List any dependent PRs, required backend changes, or manual setup steps. Remove this section if none. -->

## Testing

### Ephemeral E2E Tests

Once PR is ready and preliminary checks pass, trigger tests by posting a comment `/run-playwright` on this PR.

> Tests run against a fresh AAP instance (version based on branch).

### External Server E2E Runs

<!-- If applicable, attach run(s) from an external server using the GitHub Actions below. Mention the deployment type of the environment used.
- [Run Playwright with Currents](../actions/workflows/run-playwright-currents.yml)
-->

### Manual Testing

<!-- Steps to verify this change, if not obvious from the Jira issue. -->

### Screenshots

<!-- If applicable. Any visual/UI changes MUST include before and after screenshots. -->
