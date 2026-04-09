# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

This is the Ansible Automation Platform (AAP) UI monorepo built with React, TypeScript, and PatternFly. The project uses NPM workspaces and is structured as a unified UI that integrates multiple services:

- **Platform** - Unified gateway UI for AAP (main entry point)
- **AWX** - Ansible Controller UI
- **EDA** - Event-Driven Ansible UI
- **Hub** - Automation Hub UI
- **Chatbot** - Ansible Virtual Assistant UI
- **Framework** - Shared UI framework using PatternFly
- **Common** - Shared components and utilities

## Running Tests

- **Unit/Component Tests**: `npm run vitest` (uses Vitest)
- **Playwright Integration Tests**: See Playwright Testing section below
- **Cypress Tests**: `npm run e2e:run` (uses Cypress legacy tests)
- **Linting**: `npm run eslint`
- **Type Checking**: `npm run tsc`

## Architecture

### Monorepo Structure

- `/platform` - Main Platform UI (unified entry point)
- `/framework` - Shared UI framework
- `/frontend/awx` - AWX Controller UI
- `/frontend/eda` - Event-Driven Ansible UI
- `/frontend/hub` - Automation Hub UI
- `/frontend/chatbot` - Chatbot UI
- `/frontend/common` - Shared components
- `/cypress` - E2E tests
- `/playwright` - Additional E2E tests

### Key Technologies

- **React 18** with TypeScript
- **PatternFly** for UI components
- **React Hook Form** for form management
- **React Router** for navigation
- **SWR** for data fetching
- **i18next** for internationalization
- **Vite** for build tooling
- **Vitest** for unit testing
- **Cypress** for E2E testing
- **Playwright** for additional E2E testing
- **NX** for monorepo management

### API Integration

Each service has its own API helper wrapper - use these instead of raw URLs:

- `gatewayAPI`/users/``- Platform:`/api/gateway/`
- `awxAPI`/projects/``- AWX:`/api/controller/v2/`
- `edaAPI`/events/``- EDA:`/api/eda/v1/`
- `hubAPI`/collections/``- Hub:`/api/galaxy/`

## Development Commands

### Essential Commands

```bash
# Setup and dependencies
npm ci                    # Install dependencies
npm run clean             # Clean build artifacts

# Testing and quality
npm test                  # Run all tests (TypeScript, ESLint, Prettier, Vitest)
npm run tsc               # Type checking
npm run fix               # Fix linting and formatting
npm run i18n              # Generate translations

# Playwright tests (from /playwright directory)
cd playwright && npm run live    # Run against live server
cd playwright && npm run mock    # Run against mocked data
npx playwright test tests/path/to/test.spec.ts --project 'live chromium'

# Development
npm start                 # Start platform dev server (from /platform)
npm run build             # Build all workspaces
```

## Development Guidelines

### Code Organization

- Follow workspace-based architecture - each UI has its own workspace
- Use the shared framework for common UI patterns
- Place shared utilities in `/frontend/common`
- Use TypeScript interfaces for type safety

### Styling

- Use PatternFly components and design system
- CSS modules or styled-components for custom styling

### State Management

- Use React hooks for local state
- SWR for server state management
- Zustand for global state when needed

### Testing

- Write unit tests and component tests with Vitest
- Use Playwright for integration and e2e tests and live testing
- **CRITICAL: Avoid unnecessary mocks in Vitest tests** - only mock external APIs, browser APIs, or genuinely difficult dependencies. Do NOT mock your own utility functions, hooks, or components. Test real behavior whenever possible.
- Use msw to mock API endpoints in Vitest, rather than mocking requestGet or other fetching helper functions.

### Internationalization

- Use `useTranslation` hook from react-i18next
- Mark strings for translation with `t('String to translate')`
- Run `npm run i18n` to extract translation keys

## Playwright Testing

### Environment Configuration

Create `/playwright/.env`:

```bash
PLATFORM_UI=http://localhost:4100
PLATFORM_USERNAME=your_username
PLATFORM_PASSWORD=your_password
```

### Test Structure

Always use at least one top-level `describe` block:

```typescript
import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '../../commands/setup';

test.beforeEach(setupBefore({ path: '/your/path' }));
test.afterEach(setupAfter);

test.describe('Feature Name - Description', () => {
  test('your test description', { tag: ['@not_mock'] }, async ({ page }) => {
    // Your test code here
  });
});
```

### Test Type Guidelines

**Unit Test:** Pure logic/functions, no DOM rendering, mock dependencies, fast execution (milliseconds)

**Component Test:** Multiple units working together, mocked APIs, Vitest-based, tests UI interactions and form behaviors, don't mock unless necessary

**Integration Test:** Live API, no mocking, tests API interaction (RBAC changes, job execution, database operations)

**User Acceptance Test:** Full system-level user flows spanning multiple resources (create template → run job → verify output)

### Critical Playwright Rules

#### 1. Use `data-testid` (NOT `data-cy`)

```typescript
// BEST - Use getByTestId helper
await page.getByTestId('content-type').click();

// AVOID - Don't use data-cy in Playwright tests
await page.locator('[data-cy="content-type"]').click();
```

When migrating from Cypress: Add `data-testid` alongside existing `data-cy` attributes. Keep `data-cy` until Cypress tests are migrated.

#### 2. Selector Best Practices

```typescript
// Use exact matching to avoid ambiguity
await page.getByRole('textbox', { name: 'Name', exact: true }).fill('value');

// Scope selectors to containers to avoid strict mode violations
await expect(page.locator('dialog').getByText('Success')).toBeVisible();

// Prefer semantic selectors
await page.getByRole('button', { name: 'Submit' }).click();
```

**Key principles:**

- Use `exact: true` when similar text exists (e.g., "Name" and "Name @ timestamp")
- Scope to containers (dialog, main, nav) when elements appear multiple times
- Check `/playwright/commands/` for existing utilities before writing custom logic
- Search existing tests for patterns: `grep -r "pattern" playwright/tests/`

#### 3. Table Row Selection - CRITICAL

**ALWAYS use utility functions when available** - in the playwright/commands directory.

Tests may run in an environment where data is paginated off the screen. Utilities
like `clickTableRow()` or `getTableRow` perform necessary filtering to avoid
test flakiness.

```typescript
import { getTableRow } from '../../../commands/getTableRow';

// CORRECT - filters for needed row automatically
await clickTableRow({ filterLabel: 'Name', text: credentialTypeName }, page);

// NEVER do this - fails due to pagination
const roleRow = page.getByRole('row').filter({ hasText: roleName });
```

#### 4. API Response Interception for Dynamic Values

Capture exact API-generated values instead of guessing patterns:

```typescript
// Set up interception before action
const copyResponsePromise = page.waitForResponse(
  (response) => response.url().includes('/copy/') && response.status() === 201
);

await page.getByRole('menuitem', { name: 'Duplicate template' }).click();

const copyResponse = await copyResponsePromise;
const copiedResource = (await copyResponse.json()) as ResourceType;
const copiedName = copiedResource.name; // Use for assertions and cleanup
```

#### 5. Test Validation - CRITICAL

**ALWAYS run tests after creating/updating them** before considering work complete:

```bash
# Fail-fast mode for immediate feedback
cd playwright && npx playwright test tests/path/to/test.spec.ts --project 'live chromium' --max-failures=1 --retries=0

# Debug mode if tests fail
cd playwright && npx playwright test tests/path/to/test.spec.ts --project 'live chromium' --debug
```

**CRITICAL RULE**: Never conclude test work until ALL tests pass AND all linting/TypeScript issues are resolved.

### Test Development Methodology

**ALWAYS validate workflows manually before writing tests** using browser automation tools (MCP server):

1. Navigate through complete user workflow manually
2. Identify exact selectors by examining snapshots
3. Test each interaction (clicks, form fills, etc.)
4. Verify expected page states after actions
5. Identify dynamic values requiring API interception
6. Write tests using verified selectors and workflows
7. Run tests as final validation (should pass on first run)

This prevents: write test → run test → fix selector → repeat.

**Browser setup for AAP:**

1. Navigate to `https://localhost:4100` (use HTTPS)
2. Handle SSL warning: Type `thisisunsafe` on the warning page to bypass (or click "Advanced" → "Proceed to localhost (unsafe)")
3. Login with credentials from `/playwright/.env` (default: admin / Admin!Password!Gw)

**Important for Playwright MCP:** The Playwright MCP browser automation tool will encounter the SSL certificate warning page when navigating to `https://localhost:4100`. You must bypass this warning by typing `thisisunsafe` on the warning page before the MCP can interact with the AAP UI.

### Common Test Utilities

#### Generic Commands

Located in `/playwright/commands/`:

- `setupBefore()` / `setupAfter()` - Test setup and teardown
- `navigateTo()` - Navigate to specific pages
- `getTableRow()` - Find table rows (handles pagination) **[USE THIS FOR ALL TABLE INTERACTIONS]**
- `clickTableRow()` - Interact with table rows
- `clickPageAction()` - Click page action buttons
- `login()` - Handle authentication
- `createE2EName()` - Generate unique test names
- `confirmAndAssertDeletion()` - Handle deletion confirmations
- `bulkDeleteResources()` - Generic bulk deletion from list view
- `deleteResourceFromDetailsPage()` - Generic deletion from details page
- `deleteResourceFromList()` - Generic deletion from list view

#### Resource-Specific Utilities

Located in `/playwright/utils/`

Resource utilities follow the `Resource.api/ui.action()` pattern:

```typescript
import { Organization } from '@ansible/playwright/utils';

// API-based operations (faster, for test setup/teardown)
const org = await Organization.api.create(page, { name: 'Test Org' });
await Organization.api.delete(page, org.id);

// UI-based operations (for testing user workflows)
await Organization.ui.create(page, { organizationName: 'Test Org' });
```

### Test Tags

- `@not_mock` - Don't run against mocked data

### Debugging

```bash
# Playwright Inspector
npx playwright test --debug

# View trace files
npx playwright show-trace trace.zip

# View coverage
npm run coverage
```

## Environment Setup

```bash
# Platform server URL
export PLATFORM_SERVER='https://localhost:443'

# For standalone services (if needed)
export AWX_SERVER='https://localhost:8043'
export EDA_SERVER='http://localhost:8000'
export HUB_SERVER='http://localhost:5001'
```

**Prerequisites:** Node.js 20.x+, NPM 8.x+

## Common Tasks

### Adding Features

1. Identify appropriate workspace (platform, awx, eda, hub, etc.)
2. Use shared framework components when possible
3. Add tests for new functionality
4. Update translations if needed

### Working with Forms

- Use React Hook Form with framework form components
- Follow PageForm patterns in the framework
- For validation logic tests, prefer hook-level tests with `renderHook` over rendering full forms

### API Integration

- Use appropriate API helper wrappers for each service
- Follow existing patterns for error handling
- Use SWR for data fetching and caching

## Troubleshooting

### Common Issues

- **Build errors**: Run `npm run clean` then `npm ci`
- **Type errors**: Check TypeScript configuration in relevant workspace
- **Playwright test failures**:
  - Verify UI server running on port 4100
  - Check `/playwright/.env` credentials
  - Use `exact: true` for selector specificity
  - Run with `--debug` flag
  - Use `getTableRow()` utility for table interactions
  - Use MCP server to examine live UI structure

### Logs

- Platform: Check platform server logs
- Development: Browser console and terminal output
- Tests: Cypress/Playwright reports and traces (`npx playwright show-trace trace.zip`)

## AI Assistant Guidelines

### Code Quality Standards

- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write descriptive test names
- Add comments only for complex logic
- Ensure proper error handling

### File Naming Conventions

- Test files: `*.spec.ts` or `*.test.ts`
- Component files: PascalCase (e.g., `UserTable.tsx`)
- Utility files: camelCase (e.g., `apiHelpers.ts`)
- Constants: UPPER_SNAKE_CASE

### Best Practices

- Always prefer editing existing files over creating new ones
- Use existing Playwright commands where possible
- Create generic commands for reusable patterns
- Validate all changes with tests, linting, and TypeScript checking
- Remove obvious comments from test files
- Begin test names with "should"
- Follow established patterns in the codebase
