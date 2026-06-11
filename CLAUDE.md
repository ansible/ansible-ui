# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Claude Agent Instructions

Claude, you have access to skills that must be loaded based on the task at hand.
Read the relevant skill file(s) **before** writing code.

| Trigger                                                | Skill to read                                           |
| ------------------------------------------------------ | ------------------------------------------------------- |
| Before implementing, reviewing, or refactoring frontend code | `.claude/skills/frontend_specialist.md`            |
| Before writing components, forms, pages, or hooks      | `.claude/skills/coding_standards.md`                    |
| Before writing or reviewing any test file              | `.claude/skills/testing_guidelines.md`                  |
| Before coding with React, SWR, Vitest, Vite, or PF6   | `.claude/skills/library_references.md`                  |
| Before reviewing a pull request                        | `.claude/skills/pr_review.md`                           |
| When fixing SonarCloud issues                          | `.claude/skills/sonarcloud-remediation/sonarcloud-remediation.md` |

> **Enforced by hook:** A `PreToolUse` hook (`.claude/hooks/skill-gate.sh`) will **block** your first `Edit`/`Write` to each source file category and list the required skills. The file-to-skill mapping lives in [`.claude/skill-triggers.json`](.claude/skill-triggers.json) (single source of truth). Read the listed skills with the `Read` tool, then retry. This applies to all contributors automatically.

> **To add or change skill triggers:** Edit [`.claude/skill-triggers.json`](.claude/skill-triggers.json). The hook and this table should stay in sync -- the JSON is what the hook enforces at runtime.

### Common PR Mistakes Checklist

Before finishing any code task, verify:

1. No hardcoded API paths — use `awxAPI`/`edaAPI`/`hubAPI`/`gatewayAPI` tagged template helpers
2. Workspace PageForm wrappers used — `AwxPageForm`/`EdaPageForm`/`HubPageForm`/`PlatformPageForm`, not raw `PageForm`
3. Framework components checked first — search `/framework` before creating new components
4. MSW for API mocking in tests — mock at the HTTP level, not by mocking CRUD functions
5. `userEvent.setup()` in tests — never `fireEvent`
6. Accessible queries first — `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
7. Never compare translated display strings in logic — compare raw API values
8. No `any` types — use proper types or `unknown` with type guards
9. `Readonly<Props>` on all component props
10. Quality gates pass — `npm run tsc && npm run eslint && npm run prettier:fix`

### Feature Preservation

Never remove existing features, routes, or components without explicit
instruction. If a task might affect existing functionality, confirm before
proceeding.

## Project Overview

This is the Ansible UI monorepo built with React, TypeScript, and PatternFly. The project uses NPM workspaces and is structured as a unified UI that integrates multiple services:

- **Platform** - Unified gateway UI for AAP (main entry point)
- **AWX** - AWX UI
- **EDA** - Event-Driven Ansible UI
- **Hub** - Automation Hub UI
- **Chatbot** - Ansible Virtual Assistant UI
- **Framework** - Shared UI framework using PatternFly
- **Common** - Shared components and utilities

## Running Tests

- **Unit/Component Tests**: `npm run vitest` (uses Vitest)
- **Playwright Integration Tests**: See Playwright Testing section below
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
- `/playwright` - E2E tests

### Key Technologies

- **React 18** with TypeScript
- **PatternFly** for UI components
- **React Hook Form** for form management
- **React Router** for navigation
- **SWR** for data fetching
- **i18next** for internationalization
- **Vite** for build tooling
- **Vitest** for unit testing
- **Playwright** for E2E testing
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

### Component Development Guidelines

**CRITICAL: Follow the component hierarchy to maximize code reuse and consistency.**

Before writing any new UI code, follow this checklist:

1. **Check for Existing Components (in priority order)**

   - **First**: Search `/framework` for shared framework components (PageForm, PageTable, PageHeader, PageLayout, etc.)
   - **Second**: Check PatternFly 6 documentation at [patternfly.org/components](https://www.patternfly.org/components/all-components) for available components
   - **Third**: Search workspace-specific components (`/frontend/awx/components/`, `/frontend/eda/components/`, etc.)
   - **Last Resort**: Create a new component only if nothing exists

2. **Component Location Strategy**

   - **Framework-level reusable components** → `/framework/` (PageForm, PageTable, PageDetails, etc.)
   - **Workspace-specific components** → `/frontend/{workspace}/components/` (AWX-only, EDA-only, etc.)
   - **Cross-workspace shared utilities** → `/frontend/common/`
   - **Always use PatternFly 6 components** from `@patternfly/react-core` as the foundation

3. **Building New Components**

   - **ALWAYS use PatternFly 6 components** as the foundation - never recreate PF components
   - Build accessible components following PatternFly patterns and design system
   - Include comprehensive Vitest tests (see existing `.test.tsx` files)
   - For workspace-specific needs, place in workspace's component directory
   - For cross-workspace needs, consider adding to `/framework` or `/frontend/common`

4. **Custom Hooks**
   - Extract reusable logic into custom hooks
   - Place hooks in workspace's hooks directory (e.g., `/frontend/awx/hooks/`)
   - For cross-workspace hooks, place in `/frontend/common/hooks/`
   - Follow naming convention: `useXxx`
   - Include proper TypeScript types

**Example Workflow:**

```text
User Request: "Add a data table for displaying users"
Step 1: Check /framework for PageTable ✓ (exists)
Step 2: Use PageTable from framework with column configuration
Result: Reuse existing PageTable instead of creating new table component
```

```text
User Request: "Add a confirmation dialog"
Step 1: Check /framework for confirmation components ✓ (may have modal utilities)
Step 2: Check PatternFly 6 for Modal component ✓ (exists)
Step 3: Use PatternFly Modal or framework helper
Result: Use PF Modal component, not a custom dialog
```

### Code Abstraction Patterns

**CRITICAL: Actively identify and eliminate code duplication to improve maintainability.**

#### Pattern Recognition Checklist

| Pattern Detected                      | Action Required                                     |
| ------------------------------------- | --------------------------------------------------- |
| **Repeated JSX structure** (2+ times) | → Create a **Component** in appropriate location    |
| **Repeated logic/state** (2+ times)   | → Create a **Custom Hook**                          |
| **Repeated utility functions**        | → Create a **shared utility** in `/frontend/common` |
| **Similar components with variants**  | → Extend existing component with props/variants     |

#### JSX Repetition → Component

**Signs you need a component:**

- Same JSX structure appears in multiple files across workspaces
- Copy-pasted markup with minor variations (button groups, empty states, status badges)
- Similar styling patterns repeated

```tsx
// ❌ BAD: Repeated JSX pattern across multiple pages
<EmptyState>
  <EmptyStateIcon icon={CubesIcon} />
  <Title headingLevel="h4">No {resourceType} found</Title>
  <EmptyStateBody>Create a {resourceType} to get started.</EmptyStateBody>
</EmptyState>

// ✅ GOOD: Extract to reusable component
<ResourceEmptyState resourceType={resourceType} onCreate={handleCreate} />
```

#### Logic Repetition → Hook

**Signs you need a hook:**

- Same useState + useEffect pattern repeated across components
- Identical data fetching logic with SWR
- Common form validation patterns
- Repeated RBAC permission checks

```tsx
// ❌ BAD: Repeated logic in multiple components
const [selected, setSelected] = useState<Resource[]>([]);
const handleSelect = (resource: Resource, isSelecting: boolean) =>
  setSelected((prev) =>
    isSelecting ? [...prev, resource] : prev.filter((r) => r.id !== resource.id)
  );

// ✅ GOOD: Extract to hook
const { selected, handleSelect, clearSelection } = useTableSelection<Resource>();
```

#### When to Extract to Shared Locations

**For detailed code review questions about component reuse and abstraction patterns, see `.claude/skills/pr_review.md` section 3.**

**Extract to `/framework`:**

- Component used across 2+ workspaces (AWX + EDA, or AWX + Hub, etc.)
- Follows PatternFly patterns and is domain-agnostic
- Provides core UI framework functionality (tables, forms, layouts, navigation)

**Extract to `/frontend/common`:**

- Utility functions or hooks used across multiple workspaces
- Type definitions shared across workspaces
- API helpers or error handling utilities

**Keep in workspace:**

- Component specific to one service (AWX-only concepts, EDA-only workflows)
- Business logic tied to specific domain

### Testing

#### Core Principles

- Write unit tests and component tests with Vitest
- Use Playwright for integration and e2e tests and live testing
- **CRITICAL: Avoid unnecessary mocks in Vitest tests** - only mock external APIs, browser APIs, or genuinely difficult dependencies. Do NOT mock your own utility functions, hooks, or components. Test real behavior whenever possible.
- Use msw to mock API endpoints in Vitest, rather than mocking requestGet or other fetching helper functions.

#### AAA Pattern (Arrange-Act-Assert)

**Structure every test with three clear phases:**

```typescript
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { expect, test } from 'vitest'

test('should increment counter when button clicked', async () => {
  // Arrange - Set up test data and render component
  const user = userEvent.setup()
  render(<Counter initialValue={0} />)

  // Act - Perform the user action
  await user.click(screen.getByRole('button', { name: 'Increment' }))

  // Assert - Verify the expected outcome
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

**Why AAA Pattern:**

- Makes tests easier to read and understand
- Clearly separates setup, action, and verification
- Helps identify what the test is actually testing
- Standard pattern used across the industry

#### What to Test

| Type          | Focus On                                                | Example                               |
| ------------- | ------------------------------------------------------- | ------------------------------------- |
| **Component** | User interactions, conditional rendering, accessibility | Button clicks, form submissions, ARIA |
| **Hook**      | Return values, state transitions, callback invocations  | `useTableSelection`, `usePageDialog`  |
| **Utility**   | Input → output transformations, edge cases              | `formatDate`, `parseJobStatus`        |
| **Form**      | Validation logic, field interactions                    | Required fields, format validation    |

#### What NOT to Test

- **Implementation details** - Internal state, private methods, how something works internally
- **Third-party library behavior** - PatternFly components, React Router, i18next
- **Static content** - Hardcoded text that never changes
- **Framework behavior** - React rendering, hook lifecycle

```typescript
// ❌ BAD: Testing implementation details
test('should update internal state', () => {
  const { result } = renderHook(() => useCounter())
  expect(result.current.internalState).toBe(0) // Don't test private state
})

// ✅ GOOD: Testing behavior
test('should display incremented count', async () => {
  render(<Counter />)
  await user.click(screen.getByRole('button', { name: 'Increment' }))
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

#### Test Coverage Guidance

**Aim for meaningful coverage of critical paths:**

- **Happy path** - Test the most common user flow
- **Error cases** - Test error handling and validation
- **Edge cases** - Test boundary conditions (empty lists, max values, null handling)
- **User interactions** - Test all clickable elements, forms, navigation

**Example - Minimum coverage for a component:**

```typescript
describe('ResourceListPage', () => {
  test('should display resources in table', () => {}); // Happy path
  test('should handle empty state when no resources', () => {}); // Edge case
  test('should delete resource when delete clicked', async () => {}); // Interaction
  test('should display error message on API failure', () => {}); // Error case
});
```

### Internationalization (i18n)

**CRITICAL: Never use user-facing translatable strings in conditional logic or comparisons.**

User-facing strings that will be translated should **only be used for display purposes**. Using them in logic creates bugs when the application is localized to other languages.

#### Basic Usage

- Use `useTranslation` hook from react-i18next: `const { t } = useTranslation()`
- Mark strings for translation: `t('String to translate')`
- Run `npm run i18n` to extract translation keys

#### Anti-Pattern: Comparing Display Strings

**Never compare translated strings - they break in other languages.**

```typescript
// ❌ BAD: Comparing translated text
if (t('Active') === 'Active') { ... }           // Breaks in Spanish/French/etc.
if (jobType === t('Playbook run')) { ... }      // Breaks when localized
if (t(status) === 'Running') { ... }            // Never matches in other languages
```

#### Correct Patterns

##### 1. Compare Raw/Internal Values (from API)

```typescript
// ✅ GOOD: Check the raw API value, translate only for display
if (resource.status === 'active') {
  // 'active' is from API contract, not a display string
  setVariant('success')
}
return <Label variant={variant}>{t(resource.status)}</Label>

// ✅ GOOD: Use API enum values for logic
if (job.type === 'playbook') {
  // 'playbook' is the API value
  return <PlaybookIcon />
}
```

##### 2. Use TypeScript Enums or Constants

```typescript
// ✅ GOOD: Define internal constants separate from display
const ExecutionStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'successful',
  FAILED: 'failed',
} as const;

// Compare internal values
if (execution.status === ExecutionStatus.RUNNING) {
  return 'info';
}

// Map to display strings separately
const statusLabels: Record<string, string> = {
  pending: t('Pending'),
  running: t('Running'),
  successful: t('Success'),
  failed: t('Failed'),
};
```

##### 3. Use Value-to-Variant Mapping

```typescript
// ✅ GOOD: Separate logic values from display labels
const statusConfig: Record<string, { variant: 'success' | 'danger' | 'warning' }> = {
  successful: { variant: 'success' },
  failed: { variant: 'danger' },
  running: { variant: 'warning' },
}

const config = statusConfig[execution.status] // Use API value
return <Label variant={config.variant}>{t(execution.status)}</Label>
```

#### Allowed String Comparisons

These types of strings are **safe** to use in logic (they won't be translated):

- **API response values**: `status === 'successful'`, `type === 'job_template'`, `kind === 'playbook'`
- **Route paths**: `pathname === '/organizations'`, `path.includes('/settings')`
- **Internal constants**: `mode === 'edit'`, `view === 'list'`
- **Technical identifiers**: `file.endsWith('.yaml')`, `name.startsWith('demo_')`

#### Quick Checklist

Before writing conditional logic with strings:

1. ✅ Is this string from an API response? → **Safe to use in logic**
2. ✅ Is this an internal constant/route/identifier? → **Safe to use in logic**
3. ❌ Is this string shown to users in the UI via `t()`? → **Do NOT use in logic**
4. ❌ Would this string be translated to other languages? → **Do NOT use in logic**

#### Example: Status Badge Component

```typescript
// ✅ GOOD: Complete example of proper i18n usage
interface StatusBadgeProps {
  status: 'pending' | 'running' | 'successful' | 'failed' // API values
}

const STATUS_CONFIG = {
  pending: { variant: 'warning' as const, label: 'Pending' },
  running: { variant: 'info' as const, label: 'Running' },
  successful: { variant: 'success' as const, label: 'Success' },
  failed: { variant: 'danger' as const, label: 'Failed' },
}

function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status] // Use API value for lookup

  return <Label variant={config.variant}>{t(config.label)}</Label> // Translate for display
}

// Usage with API response
<StatusBadge status={job.status} /> // job.status is 'successful' from API
```

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
- Tests: Playwright reports and traces (`npx playwright show-trace trace.zip`)

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
