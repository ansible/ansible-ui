## Summary

Jira: <!-- AAP-XXXXX -->

<!-- What changed and why? For backports, link the original PR. -->

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

## Dependencies

<!-- List any dependent PRs, required backend changes, or manual setup steps. Remove this section if none. -->

## Testing

### Ephemeral E2E Tests

Trigger tests by posting a comment `/run-aap-ui-playwright` on this PR.

> Tests run against a fresh AAP instance (version based on branch).

### External Server E2E Runs

<!-- If applicable, attach run(s) from an external server using the GitHub Actions below. Mention the deployment type of the environment used.
- [Run Playwright with Currents](../actions/workflows/run-playwright-currents.yml)
-->

### Manual Testing

<!-- Steps to verify this change, if not obvious from the Jira issue. -->

### Screenshots

<!-- If applicable. Any visual/UI changes MUST include before and after screenshots. -->
