# Ansible UI

<!-- test PR for devel CI validation (v2) - safe to close -->
Ansible UI code is housed in this repo and is members listed in the CODEOWNERS. On the devel branch, you can find the most up-to-date stable code for the UI.

UI projects for [Ansible](https://docs.ansible.com).

- [Getting Started](#getting-started)
- [Deployment Types](/DEPLOYMENT_TYPES.md)
- [Environment Variables](#environment-variables)
- [NPM Scripts](#npm-scripts)
- [Documentation](#documentation)
- [Code of Conduct](#code-of-conduct)

## Getting Started

1. Prerequisites
   - Node 18.x and up (recommended)
   - NPM 8.x and up (recommended)

   Note: The project should with older versions of node and npm but may require regenerating the package-lock.json.

2. Clone Repository

   ```zsh
   git clone git@github.com:ansible/ansible-ui.git
   ```

3. Install Package Dependencies

   ```zsh
   npm ci
   ```

4. cd to Platform directory

   ```zsh
   cd platform
   ```

5. Set `PLATFORM_SERVER` variable and then run `npm run start` to stand up the UI

## Environment Variables

| Environment Variable | Description                                      |
| -------------------- | ------------------------------------------------ |
| `AWX_API_PREFIX`     | The AWX server API prefix.                       |
| `EDA_API_PREFIX`     | The EDA server API prefix.                       |
| `HUB_API_PREFIX`     | The HUB or Galaxy server API prefix.             |
| `PLATFORM_USERNAME`  | Username to log in with (ie: 'e2e' or 'dev').    |
| `PLATFORM_PASSWORD`  | The password of your user.                       |
| `PLATFORM_SERVER`    | If using a Jenkins build, same as baseUrl above. |

```zsh
export AWX_API_PREFIX='/api/controller/v2'
export EDA_API_PREFIX='/api/eda/v1'
export PLATFORM_SERVER='url of build goes here with no trailing slash'
export PLATFORM_USERNAME='dev'
export PLATFORM_PASSWORD='nomeetingsfriday'
```

## NPM Scripts

### From the root of AAP-UI

| NPM Script    | Description                    |
| ------------- | ------------------------------ |
| `npm run tsc` | Run Typescript compiler checks |

### From the platform directory of AAP-UI

| NPM Script             | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run start`        | Start Platform. Must run local build. |
| `npm run prettier`     | Run prettier format checks            |
| `npm run prettier:fix` | Fix prettier format of files          |
| `npm run eslint`       | Run eslint checks                     |
| `npm run eslint:fix`   | Fix linting errors                    |

## Documentation

- [Development](./docs/DEVELOPMENT.md)
- [Framework](./framework/README.md) - A framework for building applications using [PatternFly](https://www.patternfly.org).
- [Handling Errors in Forms](./framework/PageForm/README.md) - A component for handling forms and errors.

## Code of Conduct

We follow the [Ansible Code of Conduct](https://docs.ansible.com/projects/ansible/latest/community/code_of_conduct.html) in all our interactions within this project.

If you encounter abusive behavior, please refer to the [policy violations](https://docs.ansible.com/projects/ansible/latest/community/code_of_conduct.html#policy-violations) section of the Code for information on how to raise a complaint.

## Communication

* Join the Ansible forum:
  * [Posts tagged with 'ui'](https://forum.ansible.com/tag/ui): subscribe to participate in UI related conversations.
  * [Social Spaces](https://forum.ansible.com/c/chat/4): gather and interact with fellow enthusiasts.
  * [News & Announcements](https://forum.ansible.com/c/news/5): track project-wide announcements including social events. The [Bullhorn newsletter](https://docs.ansible.com/projects/ansible/latest/community/communication.html#the-bullhorn), which is used to announce releases and important changes, can also be found here.

For more information about communication, see the [Ansible communication guide](https://docs.ansible.com/projects/ansible/latest/community/communication.html).

### Running Standalone Platform Components (Not Recommended)

#### NPM Scripts for Standalone Builds

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

#### Environment Variables for Standalone Builds

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
export AWX_USERNAME='dev'
export AWX_PASSWORD='nomeetingsfriday'

export EDA_SERVER=http://localhost:8000
export EDA_USERNAME='dev'
export EDA_PASSWORD='nomeetingsfriday'

export HUB_SERVER=http://localhost:5001
export HUB_USERNAME='dev'
export HUB_PASSWORD='nomeetingsfriday'
```
