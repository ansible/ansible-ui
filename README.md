# Ansible UI

UI projects for [Ansible](https://www.ansible.com).

- [Getting Started](#getting-started)
- [Working with Automation Controller (AWX) UI](#working-with-automation-controller-awx-ui)
- [Working with Automation Hub UI](#working-with-automation-hub-ui)
- [Working with Event Driven Automation UI](#working-with-event-driven-automation-ui)
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

## Working with Automation Controller (AWX) UI

- Start AWX

   |  Environment | Description                                |
   | -----------: | ------------------------------------------ |
   | AWX_PROTOCOL | The AWX server protocol (http) or (https). |
   |   AWX_SERVER | The AWX server address with port.          |

   ```
   AWX_PROTOCOL=http
   AWX_SERVER=localhost:8043
   ```

   ```
   npm run awx
   ```

- Run AWX Component Tests

   ```
   npm run component:awx
   ```

- Run AWX E2E Tests

   |          Environment | Description                                |
   | -------------------: | ------------------------------------------ |
   | CYPRESS_AWX_PROTOCOL | The AWX server protocol (http) or (https). |
   |   CYPRESS_AWX_SERVER | The AWX server address with port.          |
   | CYPRESS_AWX_USERNAME | The AWX server username.                   |
   | CYPRESS_AWX_PASSWORD | The AWX server password.                   |

   ```
   CYPRESS_AWX_PROTOCOL=$AWX_PROTOCOL
   CYPRESS_AWX_SERVER=$AWX_SERVER
   CYPRESS_AWX_USERNAME='my-user'
   CYPRESS_AWX_PASSWORD='my-password'
   ```

   ```
   npm run e2e:awx
   ```

## Working with Automation Hub UI

- Start HUB

   |  Environment | Description                                |
   | -----------: | ------------------------------------------ |
   | HUB_PROTOCOL | The HUB server protocol (http) or (https). |
   |   HUB_SERVER | The HUB server address with port.          |

   ```
   HUB_PROTOCOL=http
   HUB_SERVER=localhost:8043
   ```

   ```
   npm run hub
   ```

- Run HUB Component Tests

   ```
   npm run component:hub
   ```

- Run HUB E2E Tests

   |          Environment | Description                                |
   | -------------------: | ------------------------------------------ |
   | CYPRESS_HUB_PROTOCOL | The HUB server protocol (http) or (https). |
   |   CYPRESS_HUB_SERVER | The HUB server address with port.          |
   | CYPRESS_HUB_USERNAME | The HUB server username.                   |
   | CYPRESS_HUB_PASSWORD | The HUB server password.                   |

   ```
   CYPRESS_HUB_PROTOCOL=$HUB_PROTOCOL
   CYPRESS_HUB_SERVER=$HUB_SERVER
   CYPRESS_HUB_USERNAME='my-user'
   CYPRESS_HUB_PASSWORD='my-password'
   ```

   ```
   npm run e2e:hub
   ```

## Working with Event Driven Automation UI

- Start EDA

   |  Environment | Description                                |
   | -----------: | ------------------------------------------ |
   | EDA_PROTOCOL | The EDA server protocol (http) or (https). |
   |   EDA_SERVER | The EDA server address with port.          |

   ```
   EDA_PROTOCOL=http
   EDA_SERVER=localhost:8043
   ```

   ```
   npm run eda
   ```

- Run EDA Component Tests

   ```
   npm run component:eda
   ```

- Run EDA E2E Tests

   |          Environment | Description                                |
   | -------------------: | ------------------------------------------ |
   | CYPRESS_EDA_PROTOCOL | The EDA server protocol (http) or (https). |
   |   CYPRESS_EDA_SERVER | The EDA server address with port.          |
   | CYPRESS_EDA_USERNAME | The EDA server username.                   |
   | CYPRESS_EDA_PASSWORD | The EDA server password.                   |

   ```
   CYPRESS_EDA_PROTOCOL=$EDA_PROTOCOL
   CYPRESS_EDA_SERVER=$EDA_SERVER
   CYPRESS_EDA_USERNAME='my-user'
   CYPRESS_EDA_PASSWORD='my-password'
   ```

   ```
   npm run e2e:eda
   ```

## Documentation

- [Development](./docs/DEVELOPMENT.md)
- [Framework](./framework/README.md) - A framework for building applications using [PatternFly](https://www.patternfly.org).

## Code of Conduct

We ask all of our community members and contributors to adhere to the [Ansible code of conduct](http://docs.ansible.com/ansible/latest/community/code_of_conduct.html). If you have questions or need assistance, please reach out to our community team at [codeofconduct@ansible.com](mailto:codeofconduct@ansible.com)
