# Ansible UI

Source for the Ansible Automation Platform web UI. The supported development path is the **Platform UI** in `platform/`, which talks to the [Ansible platform gateway](https://github.com/ansible/aap-gateway) API. Product-specific workspaces (Controller, Hub, EDA, and shared libraries) live under `frontend/` and are composed into that unified UI.

Day-to-day integration happens on the **`devel`** branch. Open pull requests against `devel`.

- [Getting started](#getting-started)
- [Repository layout](#repository-layout)
- [Environment variables](#environment-variables)
- [NPM scripts](#npm-scripts)
- [Documentation](#documentation)
- [Standalone product UIs](#standalone-product-uis-unsupported)
- [AI-assisted contributions](#ai-assisted-contributions)
- [Code of Conduct](#code-of-conduct)

## Getting started

1. **Prerequisites**

   - [Node.js](https://nodejs.org/) **24.x or newer** (see `engines` in [`package.json`](package.json))
   - npm (bundled with Node)

2. **Clone the repository**

   ```zsh
   git clone git@github.com:ansible/ansible-ui.git
   cd ansible-ui
   ```

3. **Install dependencies**

   ```zsh
   npm ci
   ```

4. **Run a platform gateway**

   The UI expects a running gateway (or full platform) that serves the unified APIs. Follow the [aap-gateway](https://github.com/ansible/aap-gateway) documentation to stand up a local environment.

5. **Configure and start the Platform UI**

   ```zsh
   export PLATFORM_SERVER='https://localhost:443'  # gateway URL (protocol://host:port)
   npm start
   ```

   `npm start` runs the dev server in `platform/` (default <https://localhost:4100>). See [`platform/README.md`](platform/README.md) for build and container options.

## Repository layout

This repository is an npm workspaces monorepo. See [`WORKSPACES.md`](WORKSPACES.md) for how packages relate to each other.

| Path | Role |
| ---- | ---- |
| `platform/` | Unified Platform UI (primary application) |
| `frontend/awx`, `frontend/hub`, `frontend/eda` | Product UI workspaces used by the platform build |
| `framework/` | Shared PatternFly-based UI framework |
| `playwright/` | End-to-end and integration tests |

## Environment variables

Common variables when running the Platform UI against a remote or local gateway:

| Environment variable | Description |
| -------------------- | ----------- |
| `PLATFORM_SERVER` | Gateway base URL (`protocol://host:port`, no trailing slash). |
| `PLATFORM_USERNAME` | Login username for live E2E tests (optional for local dev). |
| `PLATFORM_PASSWORD` | Login password for live E2E tests (optional for local dev). |
| `AWX_API_PREFIX` | Controller API prefix when required by your gateway (often `/api/controller/v2`). |
| `EDA_API_PREFIX` | EDA API prefix when required by your gateway (often `/api/eda/v1`). |
| `HUB_API_PREFIX` | Hub API prefix when required by your gateway. |

```zsh
export PLATFORM_SERVER='https://localhost:443'
export AWX_API_PREFIX='/api/controller/v2'
export EDA_API_PREFIX='/api/eda/v1'
```

Playwright tests use additional variables; see [`playwright/Playwright.md`](playwright/Playwright.md).

## NPM scripts

### From the repository root

| Script | Description |
| ------ | ----------- |
| `npm start` | Start the Platform UI dev server (`platform/`) |
| `npm test` | Run eslint, TypeScript, Prettier, and Vitest across workspaces |
| `npm run tsc` | TypeScript checks |
| `npm run eslint` / `npm run eslint:fix` | Lint (all workspaces via nx) |
| `npm run build` | Production builds |

### From `platform/`

| Script | Description |
| ------ | ----------- |
| `npm run start` | Platform UI dev server on port 4100 |
| `npm run build` | Production build (output under `build/platform`) |
| `npm run test` | Workspace-level checks |

## Documentation

- [Docs index](./docs/index.md)
- [Contributing](./CONTRIBUTING.md)
- [Platform UI](./platform/README.md)
- [Framework](./framework/README.md)
- [Playwright tests](./playwright/Playwright.md)
- [Handling errors in forms](./framework/PageForm/README.md)

## Standalone product UIs (unsupported)

`package.json` scripts still exist to run individual product workspaces in isolation (for example `npm --prefix frontend/awx start` on port 4101). **These standalone dev servers are not supported** in this repository: they are unmaintained, are not validated in CI, and often do not work with current gateway authentication and RBAC. Use the Platform UI workflow above unless you are explicitly working on a dedicated standalone effort.

| Script | Dev URL (if it starts) |
| ------ | ---------------------- |
| `npm --prefix frontend/awx start` | <http://localhost:4101> |
| `npm --prefix frontend/hub start` | <http://localhost:4102> |
| `npm --prefix frontend/eda start` | <http://localhost:4103> |

Legacy environment variables such as `AWX_SERVER`, `EDA_SERVER`, and `HUB_SERVER` applied to those flows only.

## AI-assisted contributions

This project may use AI-assisted development. Contributors may use AI tools and
remain responsible for their work. See [`AI_POLICY.md`](AI_POLICY.md) and the
[Ansible community AI policy](https://docs.ansible.com/projects/ansible/latest/community/ai_policy.html).

## Code of Conduct

We follow the [Ansible Code of Conduct](https://docs.ansible.com/projects/ansible/latest/community/code_of_conduct.html) in all our interactions within this project.

If you encounter abusive behavior, please refer to the [policy violations](https://docs.ansible.com/projects/ansible/latest/community/code_of_conduct.html#policy-violations) section of the Code for information on how to raise a complaint.

## Communication

* Join the Ansible forum:
  * [Posts tagged with 'ui'](https://forum.ansible.com/tag/ui): subscribe to participate in UI related conversations.
  * [Social Spaces](https://forum.ansible.com/c/chat/4): gather and interact with fellow enthusiasts.
  * [News & Announcements](https://forum.ansible.com/c/news/5): track project-wide announcements including social events. The [Bullhorn newsletter](https://docs.ansible.com/projects/ansible/latest/community/communication.html#the-bullhorn), which is used to announce releases and important changes, can also be found here.

For more information about communication, see the [Ansible communication guide](https://docs.ansible.com/projects/ansible/latest/community/communication.html).
