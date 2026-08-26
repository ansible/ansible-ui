---
name: frontend-overlay
description: >
  Product-specific frontend wrappers, API clients, and paths for ansible-ui.
  Use when implementing or reviewing UI in this monorepo.
---

# Overlay — ansible-ui

## Stack

- React 18, not 19 — no `ref`-as-prop, no `use(Context)` (exact version in `package.json`)
- PatternFly 6 (exact version in `package.json`)
- Node 20+ (`engines` in `package.json`)
- Server state: SWR
- Router: react-router

## Paths

- UI package root: repo root (npm workspaces)
- Components: `framework/` (shared), `frontend/{awx,eda,hub,chatbot}/`, `platform/`
- Hooks: workspace `hooks/` or `frontend/common/hooks/`
- API helpers: `awxAPI` / `edaAPI` / `hubAPI` / `gatewayAPI` (not a generated typed client)
- Mock API handlers: MSW in Vitest. Playwright also has a mock project
- E2E: `playwright/` (`playwright.config.ts`, `commands/`, `tests/`, `utils/`)
- Storybook command and port: N/A — no Storybook
- Check command: `npm test` (eslint + tsc + prettier + vitest). There is no `npm run check`
- Test command: `npm run vitest` (unit); Playwright from `playwright/`
- Instruction files: `CLAUDE.md` (symlink `AGENTS.md`)

## Wrappers (use these, not raw PatternFly)

Global/shared components live in the `framework/` package — search there first
before reaching for raw PatternFly or writing a new component.

| Pattern | Component / hook | Notes |
| --- | --- | --- |
| Page shell | `PageLayout` | `framework/` |
| Page header | `PageHeader` | `framework/` |
| Content panel | `Page` helpers in `framework/` | Search `framework/` before new components |
| List + table + pagination | `PageTable` + `useAwxView` / `useEdaView` / `useHubView` | Workspace view hook |
| Empty (no data / no filter / error) | framework empty states | |
| Confirmation | framework dialog / PF Modal | Reversible vs destructive |
| Error with retry | workspace error adapter | See coding_standards |
| Forms | `AwxPageForm` / `EdaPageForm` / `HubPageForm` / `PlatformPageForm` | Never raw `PageForm` |
| Toast / alert helper | framework alerts | object form `{ title, description? }` |

## API

- Call the backend with workspace tagged templates + SWR / CRUD hooks (`useGet`, `usePostRequest`, …)
- Forbidden: hardcoded `/api/...` paths (ESLint-enforced — custom rule); mocking `requestGet` instead of MSW
- Error shape: per-workspace adapters (not RFC 9457 everywhere)

## Permissions

- Hook names: workspace RBAC helpers in coding_standards
- Disabled-with-tooltip: existing page action patterns
- Nav / route guards: workspace routing

## Icons

- PatternFly icons or existing framework icons in `framework/`

## Router

- `react-router`. Use `<Link>` for in-app navigation, `<Button>` for actions

## Docs links

- N/A as a single helper — follow existing `docsLinks` patterns in-tree

## Visual regression

- Page registry path: `playwright/tests/visual/` (one spec per representative page)
- Check-baselines command: `npx playwright test tests/visual/ --project "live chromium"` from `playwright/`
- Never block PRs on full-page screenshots (on-demand + weekly; live-only `@not_mock`)
- Snapshot directory: `playwright/tests/visual/` Linux `-linux.png` suffix
- Overlay module (`vr.overlay.ts`): N/A

## E2E (see testing_guidelines for write rules)

- Playwright config path: `playwright/playwright.config.ts`
- Default mode: live (`npm run live` in `playwright/`) or mock (`npx playwright test --project 'mock chromium'`)
- UI URL: `PLATFORM_UI` in `playwright/.env` (typically `https://localhost:4100`, HTTPS in browser)
- Extra env (shell): `PLATFORM_SERVER=https://localhost:443`; optional `AWX_SERVER`, `EDA_SERVER`, `HUB_SERVER`
- Secret file path: `playwright/.env` (`PLATFORM_USERNAME`, `PLATFORM_PASSWORD`). Never print values
- How to check the stack is up: UI listens on 4100; do not start a second copy
- Commands (from `playwright/`):
  - `npm run live` — live chromium
  - `npx playwright test --project 'mock chromium'`
  - `npx playwright test tests/path/to/test.spec.ts --project 'live chromium'`
  - Fail-fast: add `--max-failures=1 --retries=0`
  - Debug: `--debug`; traces: `npx playwright show-trace trace.zip`
- Write rules, table helpers, MCP SSL bypass (`thisisunsafe`): `.claude/skills/testing_guidelines.md`
- Unique-name helper: `createE2EName()` in `playwright/commands/`
- Cleanup helper: `setupAfter`, resource `*.api.delete`, `confirmAndAssertDeletion`

## Review remainder (lint cannot catch)

| Miss | Grep / check |
| --- | --- |
| Raw `PageForm` in a workspace UI | `PageForm` import from framework in `frontend/` or `platform/` |
| Hardcoded API path | `/api/controller`, `/api/eda`, `/api/galaxy`, `/api/gateway` as strings |
| `fireEvent` in tests | `fireEvent` in `*.test.tsx` |
| Translated string used in logic | `if (t(` or `=== t(` |

## Review harvest

- Default GitHub repos: `ansible/ansible-ui`
- Default `--since` window: 90 days
- Recurring reviewer logins: N/A
