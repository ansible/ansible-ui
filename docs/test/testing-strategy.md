# Testing Strategy

## Objectives

- Ensure the platform functions as expected across all supported configurations.
- Validate pull requests to prevent regressions and breakages.

## Approach

### Nightly End-to-End Tests

- Execute full end-to-end tests against all supported configurations.
- Ensure broad coverage of critical user workflows.

### Pull Request Validation

- Run the same end-to-end tests with a mock API to validate code changes.
- Ensure quick feedback to maintain fast development cycles.

## Notes

- The testing is moving to Playwright and we have a good approach to live testing and mock testing.
- Current Cypress E2E tests will still be run nightly and maintained for the forseeable future.
- Component testing is still needed but is out of scope for this initial spike.