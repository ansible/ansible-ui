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

   ```zsh
   git clone git@github.com:ansible/ansible-ui.git
   ```

3. Install Package Dependencies

   ```zsh
   npm ci
   ```

## Environment Variables

|    Environment Variable | Description                                         |
| ----------------------: | --------------------------------------------------- |
|            `AWX_SERVER` | The AWX server (protocol://host:port).              |
|          `AWX_USERNAME` | The AWX server username. (only used by Cypress)     |
|          `AWX_PASSWORD` | The AWX server password. (only used by Cypress)     |
|                         |                                                     |
|            `EDA_SERVER` | The EDA server (protocol://host:port).              |
|          `EDA_USERNAME` | The EDA server username. (only used by Cypress)     |
|          `EDA_PASSWORD` | The EDA server password. (only used by Cypress)     |
|                         |                                                     |
|            `HUB_SERVER` | The HUB server (protocol://host:port).              |
|          `HUB_USERNAME` | The HUB server username. (only used by Cypress)     |
|          `HUB_PASSWORD` | The HUB server password. (only used by Cypress)     |
|        `HUB_API_PREFIX` | The HUB server API prefix. (`/api/galaxy`)          |
| `HUB_GALAXYKIT_COMMAND` | The galaxykit command. (`galaxykit --ignore-certs`) |

```zsh
export AWX_SERVER=https://localhost:8043
export AWX_USERNAME='my-user'
export AWX_PASSWORD='my-password'

export EDA_SERVER=http://localhost:8000
export EDA_USERNAME='my-user'
export EDA_PASSWORD='my-password'

export HUB_SERVER=http://localhost:5001
export HUB_USERNAME='my-user'
export HUB_PASSWORD='my-password'
```

> Note: For Hub integration tests: Check that the Ansible binary was correctly installed under the Python directory. Add it to the PATH variable. This is needed for the galaxykit commands that create hub resources for tests.

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
- [Handling Errors in Forms](./framework/PageForm/README.md) - A component for handling forms and errors.

## Code of Conduct

We ask all of our community members and contributors to adhere to the [Ansible code of conduct](http://docs.ansible.com/ansible/latest/community/code_of_conduct.html). If you have questions or need assistance, please reach out to our community team at [codeofconduct@ansible.com](mailto:codeofconduct@ansible.com)
