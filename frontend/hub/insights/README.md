# Hub Insights Build (Isolated)

This directory contains an **isolated build environment** for running Hub as a federated module
on console.redhat.com (Insights/CRC).

## Prerequisites

- **insights-chrome** repository cloned (e.g., `~/code/RedHatInsights/insights-chrome`)
- Node.js 20.x+ installed
- Add to `/etc/hosts`: `127.0.0.1 stage.foo.redhat.com prod.foo.redhat.com`

## Why Isolated?

The Insights build requires dependencies like `@redhat-cloud-services/frontend-components-config`
that are specific to the CRC deployment. By keeping these in a separate `package.json`:

- The root monorepo's `package-lock.json` stays clean
- Insights-specific deps don't affect other workspaces
- The insights build still uses all monorepo deps (React, PatternFly, framework, etc.)

## How It Works

```
insights/
├── HubRoot.tsx            → Entry point (exposed via Module Federation)
├── HubInsightsApp.tsx     → Insights-specific app component
├── webpack.config.cjs     → Build configuration
├── package.json           → CRC-specific dependencies
└── node_modules/          → Isolated deps (not in root package-lock)

../collections/            → Hub components (imported from parent)
../../../framework/        → Shared UI framework
../../node_modules/        → React, PatternFly, etc. (from monorepo root)
```

Webpack's module resolution walks up the directory tree, so all monorepo dependencies
are automatically available.

## Setup

```bash
# From the hub directory:
npm run insights:install   # Install isolated deps
npm run insights:serve     # Start dev server on port 8002
npm run insights:build     # Production build

# Or directly:
cd frontend/hub/insights
npm install
npm run serve
```

## Running with Chrome

1. Start the Hub dev server:

   ```bash
   cd frontend/hub
   npm run insights:serve
   ```

2. Start insights-chrome (in another terminal):

   ```bash
   cd ../insights-chrome
   npm run dev
   ```

3. Open https://stage.foo.redhat.com:1337/ansible/automation-hub

## Environment Variables

| Variable         | Default                   | Description                       |
| ---------------- | ------------------------- | --------------------------------- |
| `HUB_API_PREFIX` | `/api/automation-hub`     | API base path                     |
| `ROUTE_PREFIX`   | `/ansible/automation-hub` | UI route prefix                   |
| `HUB_CLOUD_BETA` | undefined                 | Set to "true" for beta deployment |
| `UI_PORT`        | 8002                      | Dev server port                   |

## Output

Production builds are written to `../dist-insights/` (sibling to this directory).

## Notes

- Chrome expects the module to expose `./RootApp`
- The `HubRoot` component (`HubRoot.tsx`) is the entry point for Insights mode
- PatternFly base CSS is NOT included (Chrome provides it)
- No `BrowserRouter` is used (Chrome provides the routing context)
