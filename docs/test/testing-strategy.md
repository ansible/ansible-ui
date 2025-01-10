# Testing Strategy

We have two main objectives:

- Validate the Platform UI against all supported configurations.
- Validate pull requests to prevent regressions and breakages.

## Approach

### Nightly End-to-End Tests

- Execute full end-to-end tests against all supported configurations.
- Ensure broad coverage of critical user workflows.

### Pull Request Validation

- Run the same end-to-end tests with a mock API to validate code changes.
- Ensure quick feedback to maintain fast development cycles.
