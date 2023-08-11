# Cypress Testing

Cypress is being used for both end-to-end tests and component tests.

SEE: [README](../README.md) for instructions on setting up and running tests

## Coverage

To get total coverage, run both e2e and component tests.

```
npm run cypress:run
```

Open the coverage report

```
npm run coverage
```

## AWX Cleanup during tests

Many AWX resources have an organization and if the organization is deleted the resource gets deleted. By creating an organization at the start of the tests and using it with resources and then deleting the organization, most resources clean up.

There are a few cases where resources do not get cleaned up, such as when a project is syncing, deleting the organization leaves the project around without an associated organization.

To handle this, the tests delete E2E organizations older than 2 hours old. Then the other tests delete resources that do not have an organization. This makes the system eventually cleanup the E2E resources.
