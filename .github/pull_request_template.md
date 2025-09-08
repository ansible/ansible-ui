## Description

Jira issue # <!-- Link JIRA issue -->

<!-- Include a summary of the changes and the related issue. List any dependencies that are required for this change. -->

<!-- For backports, include a link to the original PR.  -->

## Type of Change

- [ ] Bug fix
- [ ] New feature/ enhancement
- [ ] Documentation update
- [ ] Tests
- [ ] Other (please specify)

## Required Backend Work (if applicable):

<!-- Briefly describe any required backend changes (e.g., API updates, database migrations, service integrations). -->

## Feature Flags (if applicable):

<!-- List any feature flags related to this change. Include the flag name(s), instructions for enabling/disabling them, and any notes on when to toggle these flags. -->

## Testing

#### • E2E Run:

<!-- Please run both Cypress and Playwright E2E tests to help us maintain quality and avoid regressions. Share your results via GitHub Actions links or local test output. -->

- [ ] **Cypress Tests:** E2E tests completed successfully (npm run e2e:run)
  <!-- Share GitHub Actions E2E run link or local test results/screenshots -->

- [ ] **Playwright Tests:** E2E tests completed successfully (cd playwright && npm run live)
  <!-- Share GitHub Actions E2E run link or local test results/screenshots -->

<!-- 
💡 If you encounter any test failures:
• Please list them here and let us know if they're related to your changes
• If they are related to your changes, we'd appreciate fixing them before merging
• This helps us maintain stability - if regressions are introduced, we may need to collaborate on reverting or fixing them quickly
-->

#### • Manual testing instructions:

<!-- List any relevant steps needed for testing this PR (if it is not obvious from the JIRA issue). -->

#### • Screenshots (if applicable):

<!-- Include screenshots if applicable. -->

#### • Test coverage

- [ ] Component/unit/integration test added/updated to cover the changes introduced in this PR.

## Additional Notes

<!-- Provide any additional information or context that is relevant to the PR. -->
