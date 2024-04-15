# Development

## PR Review Checklist

- [ ] **Code Style**: Ensure that the code adheres to the project's style guidelines. We use Prettier and ESLint for code formatting and linting.

  - [ ] Run `npm run eslint` to check for linting errors and ensure there are no issues reported.

- [ ] **Problem Solving**: Check whether the PR addresses the issue it was intended to solve.

  - [ ] Review the linked issue to understand the background and context of the PR.
  - [ ] Read the commit messages for a clear explanation of what has changed and why.

- [ ] **New Code Idioms**: Evaluate whether the PR introduces new patterns or idioms to the codebase.

  - [ ] Consider if the introduced idiom addresses an edge case, or if a pre-existing solution could be adapted.
  - [ ] If it introduces a new idiom, make sure it is understandable and well-documented.

- [ ] **Tests**: Ensure that the tests cover the new changes and pass without issues, and that no regression is introduced.

  - [ ] Verify that all tests are passing and are thorough enough to prevent future regressions.

- [ ] **Dependencies**: Assess any newly added dependencies.
  - [ ] Confirm that new dependencies are necessary and justified.

## Project organization

| Path                   | Description                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------ |
| /frontend/awx          | The source code for the AWX UI.                                                      |
| /frontend/hub          | The source code for the HUB UI.                                                      |
| /frontend/event-driven | The source code for the EDA UI.                                                      |
| /framework             | A framework for building applications using [PatternFly](https://www.patternfly.org) |

## Testing

See: [CYPRESS.md](../cypress/CYPRESS.md)

## Internationalization (i18n)

See: [i18n.md](./i18n.md)
