# Cypress Testing

Cypress is being used for both end-to-end tests and component tests.

## NPM Test Scripts

| Command                         | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `npm run cypress:run`           | Run E2E and component tests headless.          |
| `npm run cypress:run:e2e`       | Run E2E tests headless.                        |
| `npm run cypress:run:component` | Run component tests headless.                  |
| `npm run cypress:open`          | Open the Cypress UI to run tests.              |
| `npm run cypress:coverage`      | After tests have finished, view test coverage. |

## E2E Testing

The Cypress E2E tests run against a live backend API.

```mermaid
graph LR;
    cypress --> frontend
    frontend --> proxy
    proxy --> api
```

### E2E Getting started

1. Setup Environment Variables
   <br>The E2E tests need a live API to test against. The following environment variables can be used to setup the E2E test server.

   ##### AWX

   | Environment Variable   | Description                                                                         |
   | ---------------------- | ----------------------------------------------------------------------------------- |
   | `CYPRESS_AWX_SERVER`   | URL of the AWX server to run E2E tests against. `Default: <https://localhost:8043>` |
   | `CYPRESS_AWX_USERNAME` | username for logging into the AWX server. `Default: admin`                          |
   | `CYPRESS_AWX_PASSWORD` | password for logging into the AWX server. `Default: admin`                          |

   > NOTE: Running AWX API locally defaults to <https://localhost:8043> which easily allows running E2E test against it.

   ##### EDA

   | Environment Variable      | Description                                                                                                                      |
   | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
   | `CYPRESS_EDA_SERVER`      | URL of the EDA server to run E2E tests against. `Default: <https://localhost:8000>`                                              |
   | `CYPRESS_EDA_USERNAME`    | username for logging into the EDA server. `Default: testuser`                                                                    |
   | `CYPRESS_EDA_PASSWORD`    | password for logging into the EDA server. `Default: testpass`                                                                    |
   | `CYPRESS_TEST_STANDALONE` | flag to indicate if UI should be tested standalone. (Login via route `/login` instead of `/automation-servers`) `Default: false` |

2. Run the Ansible-UI frontend and proxy

   ```
   npm start
   ```

3. Run Cypress

   Run Cypress E2E tests headless

   ```
   npm run cypress:run:e2e
   ```

   Open the Cypress UI to run e2e tests

   ```
   npm run cypress:open
   ```

## Component Testing

Run Cypress component tests headless

```
npm run cypress:run:component
```

Open the Cypress UI to run component tests

```
npm run cypress:open
```

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
