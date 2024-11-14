# NPM Workspaces

**NPM workspaces** provide a way to manage multiple packages within a single repository (often called a monorepo). Running `npm install` at the root creates symbolic links between the packages, allowing for easy sharing of dependencies across workspaces and more streamlined project management.

In our case our initial workspaces will be
```json
  "workspaces": [
    "frontend/awx",
    "frontend/hub",
    "frontend/eda",
    "frontend/common",
    "framework",
    "platform"
  ],
```

Once `npm i` has been run at the root, then any code can reference those projects by name.
```tsx
import { Application } from '@ansible/awx-ui/interfaces/Application';
```

This is the first step to making a more modular mono-repo.

We have a lot of possible use cases.
- publish a job log npm package that can be used by Ansible portal to show the job log.
- work on a plugin framework for the ui
- publish hub to clouddot
- publish analytics to clouddot


## Benefits of npm Workspaces

### 1. Unique Dependencies per Workspace
Each workspace can define its own dependencies, giving flexibility to manage distinct setups. For example:
- Framework can use Playwright-CT for **component tests**.
- Platform can use Playwright for **end-to-end (E2E) tests**.

### 2. Flexible Workspace Expansion
New workspaces can be added effortlessly. For instance:
- Add a `hub-clouddot` workspace that pulls in both `hub` and `clouddot` packages, allowing us to build the hub specifically for clouddot.
- Add a `analytics-clouddot` workspace that pulls in both `analytics` and `clouddot` packages, allowing us to build the hub specifically for clouddot.

### 3. Streamlined Testing with `nx`
The future plan is to use **`nx` repo manager** with npm workspaces to enhance our testing workflow by running only the tests affected by a change. This selective testing improves efficiency and reduces CI/CD times.

## How it Works
Running `npm install` in the root of a workspace-based project:
- Installs all dependencies for each workspace.
- Creates symbolic links between workspaces, allowing for shared code without duplication.
