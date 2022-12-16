# Cypress Testing

## Goals

- Test major user flows theough the UI such as creating, editing, and deleting.
- Run E2E tests against both a mock API and a live API.

## Running E2E Tests

| Command                     | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `npm run cypress`           | Runs the frontend and cypress headless in parallel using the mock API. |
| `npm run cypress:run`       | Run cypress headless against the mock API.                             |
| `npm run cypress:run:live`  | Run cypress headless against a live API.                               |
| `npm run cypress:open`      | Run cypress UI against the mock API.                                   |
| `npm run cypress:open:live` | Run cypress UI against a live API.                                     |
| `npm run coverage`          | After tests have finished, view test coverage.                         |

## Tests should be self contained

This is so that tests do not interfere with each other.

## Tests should be able to be run without fixtures

This is so that it can run against not only a mock server but also a live server.

To facilitate this, there are functions to setup state using the REST api.

Example

```ts
cy.requestPost<Team>('/api/v2/teams/', {
  name: 'Team ' + randomString(4),
  organization: organization.id,
}).then((team) => {
  // use created team for test
  cy.navigateTo(/^Teams$/);
  cy.clickRow(team.name);

  // cleanup the team after the test
  cy.requestDelete(`/api/v2/teams/${team.id}/`);
});
```
