## Summary

Jira: <!-- AAP-XXXXX -->

<!-- What changed and why? For backports, link the original PR. -->

## Type of Change

- [ ] Bug fix
- [ ] Enhancement
- [ ] Tests
- [ ] Documentation
- [ ] Other (please specify)

## Dependencies

<!-- List any dependent PRs, required backend changes, or manual setup steps. Remove this section if none. -->

## Testing

### Ephemeral E2E Tests

Trigger tests by posting a comment on this PR. The command depends on the base branch:

| Base branch | Playwright | Cypress |
|---|---|---|
| `main` | `/run-aap-ui-playwright` | `/run-aap-ui-cypress` |
| `stable-2.6` | `/run-aap-ui-playwright 2.6-next` | `/run-aap-ui-cypress 2.6-next` |
| `release/2.5-lts` | — | `/run-aap-ui-cypress 2.5-next` |

> Tests run against a fresh AAP instance (version based on branch). See ephemeral docs for [Playwright](https://github.com/ansible-automation-platform/aap-ui/blob/main/docs/test/automating-e2e/ephemeral-aap-playwright.md) and [Cypress](https://github.com/ansible-automation-platform/aap-ui/blob/main/docs/test/automating-e2e/ephemeral-aap-cypress.md).

### External Server E2E Runs

<!-- If applicable, attach run(s) from an external server using the GitHub Actions below. Mention the deployment type of the environment used.
- [Run Playwright with Currents](https://github.com/ansible-automation-platform/aap-ui/actions/workflows/run-playwright-currents.yml)
- [Run E2E](https://github.com/ansible-automation-platform/aap-ui/actions/workflows/run-e2e.yml)
-->

### Manual Testing

<!-- Steps to verify this change, if not obvious from the Jira issue. -->

### Screenshots

<!-- If applicable. Any visual/UI changes MUST include before and after screenshots. -->
