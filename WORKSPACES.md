# NPM Workspaces

**NPM workspaces** provide a way to manage multiple packages within a single repository (often called a monorepo). Running `npm install` at the root creates symbolic links between the packages, allowing for easy sharing of dependencies across workspaces and more streamlined project management.

Workspaces are declared in the root [`package.json`](package.json):

```json
  "workspaces": [
    "packages/*",
    "frontend/*",
    "framework",
    "platform",
    "playwright"
  ],
```

Once `npm ci` has been run at the root, code can import workspace packages by name:

```tsx
import { Application } from '@ansible/awx-ui/interfaces/Application';
```

## Benefits of npm Workspaces

### 1. Unique Dependencies per Workspace

Each workspace can define its own dependencies. For example, the `framework` package can use Playwright component tests while `playwright` owns end-to-end tests.

### 2. Flexible Workspace Expansion

New workspaces can be added under `frontend/` or `packages/` as products evolve.

### 3. Selective tasks with `nx`

The root `package.json` uses **nx** to run eslint, TypeScript, Prettier, and Vitest across workspaces and to target only affected packages where configured.

## How it Works

Running `npm ci` in the root of the project:

- Installs dependencies for each workspace.
- Links workspaces so shared code does not need to be published during local development.
