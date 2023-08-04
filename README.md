# Ansible UI

The UI projects for [Ansible](https://www.ansible.com).

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

4. Start the Projects

   - AWX - Ansible Controller

     | Environment | Description                   |
     | ----------: | ----------------------------- |
     |  AWX_SERVER | The AWX server to connect to. |

     ```
     npm run awx
     ```

   - HUB - Automation Hub

     | Environment | Description                   |
     | ----------: | ----------------------------- |
     |  HUB_SERVER | The HUB server to connect to. |

     ```
     npm run hub
     ```

   - EDA - Event Driven Automation

     | Environment | Description                   |
     | ----------: | ----------------------------- |
     |  EDA_SERVER | The EDA server to connect to. |

     ```
     npm run eda
     ```

5. View the development documentation

   - [Development](./docs/DEVELOPMENT.md)
   - [Framework](./framework/README.md) - A framework for building applications using [PatternFly](https://www.patternfly.org).

## Code of Conduct

We ask all of our community members and contributors to adhere to the [Ansible code of conduct](http://docs.ansible.com/ansible/latest/community/code_of_conduct.html). If you have questions or need assistance, please reach out to our community team at [codeofconduct@ansible.com](mailto:codeofconduct@ansible.com)

.
