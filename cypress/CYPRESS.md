# Cypress Testing

## Goals

- Test major user flows theough the UI such as creating, editing, and deleting.
- Run E2E tests against both a mock API and a live API.

## Getting started

1. Run the Ansible-UI frontend.

   ```
   npm run frontend
   ```

2. Run the Cypress UI in mock mode. Mock mode intercepts API calls and runs them against a mock.

   ```
   npm run cypress:open
   ```

3. Run the tests from the Cypress UI.

## NPM E2E Commands

| Command                     | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `npm run cypress`           | Runs the frontend and Cypress headless in parallel using the mock API. |
| `npm run cypress:frontend`  | Runs the frontend without opening the UI in the browser.               |
| `npm run cypress:run`       | Run Cypress headless against the mock API.                             |
| `npm run cypress:run:live`  | Run Cypress headless against a live API.                               |
| `npm run cypress:open`      | Run Cypress UI against the mock API.                                   |
| `npm run cypress:open:live` | Run Cypress UI against a live API.                                     |
| `npm run coverage`          | After tests have finished, view test coverage.                         |

## Testing Philosophy

### Tests should be self contained

This is so that tests do not interfere with each other.

### Tests should be able to be run without fixtures

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
