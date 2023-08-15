# Ansible UI

UI projects for [Ansible](https://www.ansible.com).

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [NPM Scripts](#npm-scripts)
- [Documentation](#documentation)
- [Code of Conduct](#code-of-conduct)

## Getting Started

1. Prerequisites

   - Node 18.x (recommended)
   - NPM 8.x (recommended)

   Note: The project should with older versions of node and npm but may require regenerating the package-lock.json.

2. Clone Repository

   ```
   git clone git@github.com:ansible/ansible-ui.git
   ```

3. Install Package Dependencies

   ```
   npm ci
   ```

## Environment Variables

|   Environment Variable | Description                                |
| ---------------------: | ------------------------------------------ |
|         `AWX_PROTOCOL` | The AWX server protocol (http) or (https). |
|             `AWX_HOST` | The AWX server address with port.          |
|   `CYPRESS_AWX_SERVER` | The AWX server URL.                        |
| `CYPRESS_AWX_USERNAME` | The AWX server username.                   |
| `CYPRESS_AWX_PASSWORD` | The AWX server password.                   |
|                        |                                            |
|         `HUB_PROTOCOL` | The HUB server protocol (http) or (https). |
|             `HUB_HOST` | The HUB server address with port.          |
|   `CYPRESS_HUB_SERVER` | The HUB server URL.                        |
| `CYPRESS_HUB_USERNAME` | The HUB server username.                   |
| `CYPRESS_HUB_PASSWORD` | The HUB server password.                   |
|                        |                                            |
|         `EDA_PROTOCOL` | The EDA server protocol (http) or (https). |
|             `EDA_HOST` | The EDA server address with port.          |
|   `CYPRESS_EDA_SERVER` | The EDA server URL.                        |
| `CYPRESS_EDA_USERNAME` | The EDA server username.                   |
| `CYPRESS_EDA_PASSWORD` | The EDA server password.                   |

```
AWX_PROTOCOL=http
AWX_HOST=localhost:8043
CYPRESS_AWX_SERVER=$AWX_PROTOCOL://$AWX_HOST
CYPRESS_AWX_USERNAME='my-user'
CYPRESS_AWX_PASSWORD='my-password'

HUB_PROTOCOL=http
HUB_HOST=localhost:8000
CYPRESS_HUB_SERVER=$HUB_PROTOCOL://$HUB_HOST
CYPRESS_HUB_USERNAME='my-user'
CYPRESS_HUB_PASSWORD='my-password'

EDA_PROTOCOL=http
EDA_HOST=localhost:5001
CYPRESS_EDA_SERVER=$EDA_PROTOCOL://$EDA_HOST
CYPRESS_EDA_USERNAME='my-user'
CYPRESS_EDA_PASSWORD='my-password'
```

## NPM Scripts

| NPM Script                  | Description                             |
| --------------------------- | --------------------------------------- |
| `npm run awx`               | Run AWX on <http://localhost:4101>      |
| `npm run e2e:awx`           | Run AWX E2E tests from Cypress UI       |
| `npm run e2e:run:awx`       | Run AWX E2E tests from CLI              |
| `npm run component:awx`     | Run AWX component tests from Cypress UI |
| `npm run component:run:awx` | Run AWX component tests from CLI        |
|                             |                                         |
| `npm run hub`               | Run HUB on <http://localhost:4102>      |
| `npm run e2e:hub`           | Run HUB E2E tests from Cypress UI       |
| `npm run e2e:run:hub`       | Run HUB E2E tests from CLI              |
| `npm run component:hub`     | Run HUB component tests from Cypress UI |
| `npm run component:run:hub` | Run HUB component tests from CLI        |
|                             |                                         |
| `npm run eda`               | Run EDA on <http://localhost:4103>      |
| `npm run e2e:eda`           | Run EDA E2E tests from Cypress UI       |
| `npm run e2e:run:eda`       | Run EDA E2E tests from CLI              |
| `npm run component:eda`     | Run EDA component tests from Cypress UI |
| `npm run component:run:eda` | Run EDA component tests from CLI        |
|                             |                                         |
| `npm run tsc`               | Run Typescript compiler checks          |
| `npm run eslint`            | Run eslint checks                       |
| `npm run prettier`          | Run prettier format checks              |
| `npm run prettier:fix`      | Fix prettier format of files            |

## Documentation

- [Development](./docs/DEVELOPMENT.md)
- [Framework](./framework/README.md) - A framework for building applications using [PatternFly](https://www.patternfly.org).

## Code of Conduct

We ask all of our community members and contributors to adhere to the [Ansible code of conduct](http://docs.ansible.com/ansible/latest/community/code_of_conduct.html). If you have questions or need assistance, please reach out to our community team at [codeofconduct@ansible.com](mailto:codeofconduct@ansible.com)

.
