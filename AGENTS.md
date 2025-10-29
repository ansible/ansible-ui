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

## Development Commands

### Root Level Commands (run from project root)

```bash
# Install dependencies
npm ci

# Run type checking across all workspaces
npm run tsc

# Run tests (TypeScript, ESLint, Prettier, Vitest)
npm test

# Run linting
npm run eslint
npm run eslint:fix

# Run formatting
npm run prettier
npm run prettier:fix

# Fix both linting and formatting
npm run fix

# Build all workspaces
npm run build

# Clean build artifacts
npm run clean

# Generate translations
npm run i18n

# Run Cypress E2E tests
npm run e2e:run
npm run e2e:run:awx
npm run e2e:run:hub
npm run e2e:run:eda
npm run e2e:run:chatbot

# Run component tests
npm run component

# Run Playwright tests (from /playwright directory)
cd playwright && npm run live    # Run against live server
cd playwright && npm run mock    # Run against mocked data
```

### Platform Development (run from `/platform` directory)

```bash
# Start platform development server
npm start

# Build platform for production
npm run build
```

### Running Tests

- **Unit/Component Tests**: `npm run vitest` (uses Vitest)
- **E2E Tests**: `npm run e2e:run` (uses Cypress)
- **Playwright E2E Tests**: See Playwright Testing section below
- **Linting**: `npm run eslint`
- **Type Checking**: `npm run tsc`

## Architecture

### Monorepo Structure

The project uses NPM workspaces with the following structure:

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

Each service has its own API prefix:

- Platform: `/api/gateway/`
- AWX: `/api/controller/v2/`
- EDA: `/api/eda/v1/`
- Hub: `/api/galaxy/`

Each route has a helper wrapper to route to the correct API based on the service that should be used in the code instead of the raw URL. This allows for easier integration and testing across services.
Example:

- gatewayAPI`/users/`
- awxAPI`/projects/`
- edaAPI`/events/`
- hubAPI`/collections/`

## Development Guidelines

### Code Organization

- Follow workspace-based architecture - each UI has its own workspace
- Use the shared framework for common UI patterns
- Place shared utilities in `/frontend/common`
- Use TypeScript interfaces for type safety

### Styling

- Use PatternFly components and design system
- CSS modules or styled-components for custom styling
- Follow PatternFly design guidelines

### State Management

- Use React hooks for local state
- SWR for server state management
- Zustand for global state when needed

### Testing

- Write unit tests with Vitest
- Use Playwright for primary E2E tests and live testing
- Follow testing best practices for React components

### Internationalization

- Use `useTranslation` hook from react-i18next
- Mark strings for translation with `t('String to translate')`
- Run `npm run i18n` to extract translation keys

## Playwright Testing

### Overview

Playwright tests provide comprehensive E2E testing capabilities and can run against both live servers and mocked data. The Playwright workspace is located in `/playwright` and includes tests for various AAP components including access management, roles, users, and UI workflows.

### Environment Configuration

Create or update `/playwright/.env` with the following variables:

```bash
PLATFORM_UI=http://localhost:4100        # UI server URL
PLATFORM_USERNAME=your_username          # Login username
PLATFORM_PASSWORD=your_password          # Login password
```

### Available Test Commands (run from `/playwright` directory)

```bash
# Run tests against live server (UI must be running)
npm run live

# Run tests against mocked data
npm run mock

# Run specific test file
npx playwright test tests/path/to/test.spec.ts --project 'live chromium'

# Run tests with specific tags
npx playwright test --grep @not_mock

# Run with debug mode
npx playwright test --debug

# View coverage report
npm run coverage

# Show trace files for debugging failed tests
npx playwright show-trace trace.zip
```

### Test Project Configuration

- **live chromium**: Tests against live server (excludes @not_live tests)
- **mock chromium**: Tests against mocked data (excludes @not_mock tests)
- **live firefox**: Firefox tests against live server
- **mock firefox**: Firefox tests against mocked data

### Writing Playwright Tests

#### Test Structure

Always use `describe` blocks to organize tests for easier debugging and troubleshooting:

```typescript
import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '../../commands/setup';

test.beforeEach(setupBefore({ path: '/your/path' }));
test.afterEach(setupAfter);

test.describe('Feature Name - Description', () => {
  test('your test description', { tag: ['@not_mock'] }, async ({ page }) => {
    // Your test code here
  });

  test('another test description', { tag: ['@not_mock'] }, async ({ page }) => {
    // Your test code here
  });
});
```

**Benefits of describe blocks:**

- Groups related tests together
- Makes test output more readable
- Easier to run specific test groups
- Better organization in test reports
- Simplifies debugging when tests fail

#### Test Type Criteria

Follow these guidelines when deciding what type of test should be created:

**Unit Test Criteria:**

- Test pure logic/functions
- No DOM rendering
- Mock ALL dependencies
- Test internal implementation details
- Fast execution (milliseconds)
- No browser needed
- Focus on "Does this function return the correct output?"
- Form field validation
- Error handling

**Component Test Criteria:**

- Assert that several units within the codebase work together correctly
- API endpoints should be mocked
- Should be written using Vitest
- Can confirm correct behavior of an entire screen, ensuring the components all interact together correctly
- Ensuring buttons are disabled under certain circumstances
- Ensuring data is displayed correctly on the page
- Asserting complex form behaviors or interaction patterns
- Navigation between screens

**Integration Test Criteria:**

- Uses a live API, no mocking
- Asserts proper integration of the system as a whole
- Target a broader set of components at one time than component tests do
- Should minimize how often integration tests cover the same API requests across multiple tests
- Primary goal should be to assert correct interaction with the API
- Editing RBAC settings as an admin, switching users, and confirming RBAC access changes as required
- Running a job and viewing output
- Saving, editing, deleting from the database

**User Acceptance Test Criteria:**

- Assert the behavior of code at the full system level
- Exercise a full user flow from start to finish, spanning multiple resources or various parts of the application
- Provide a high level of assurance that the system as a whole is operating as expected
- Full user flow creating a template, running a job, verifying output
- Creating users and configuring their RBAC settings
- Monitoring running jobs, viewing their output, and viewing failure data

#### Migrating from Cypress - CRITICAL

When migrating tests from Cypress to Playwright or creating new Playwright tests:

**ALWAYS use `data-testid` instead of `data-cy` locators:**

- Playwright tests should use `data-testid` attributes for test-specific selectors
- Cypress tests use `data-cy` attributes, but Playwright should standardize on `data-testid`
- If a `data-testid` is not available on an element that has `data-cy`, find the source component and add `data-testid`
- **Prefer `getByTestId()` over `locator('[data-testid]')`** for better readability and Playwright best practices

```typescript
// BAD - Don't use data-cy in Playwright tests
await page.locator('[data-cy="content-type"]').click();

// BETTER - Use data-testid with locator
await page.locator('[data-testid="content-type"]').click();

// BEST - Use getByTestId helper (preferred)
await page.getByTestId('content-type').click();
```

**Steps when data-testid is missing:**

1. Identify the component that renders the element with `data-cy`
2. Add `data-testid` attribute to that component alongside the existing `data-cy`
3. Use the new `data-testid` in your Playwright test
4. Keep `data-cy` in place for existing Cypress tests until they are fully migrated

**Rationale:** This ensures consistency across Playwright tests and follows Playwright best practices while maintaining backward compatibility with Cypress during the migration period.

#### Selector Best Practices

- Use `exact: true` for precise text matching:

  ```typescript
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('value');
  ```

- **Avoid strict mode violations** by being specific with selectors:

  ```typescript
  // BAD - May match multiple elements
  await expect(page.getByText('Success')).toBeVisible();

  // GOOD - Scope to specific container
  await expect(page.locator('dialog').getByText('Success')).toBeVisible();
  await expect(page.locator('tbody').getByText('Success')).toBeVisible();

  // GOOD - Use more specific selectors
  await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();

  // GOOD - Use role-based selectors with containers
  await expect(page.locator('dialog').getByRole('button', { name: 'Submit' })).toBeVisible();
  ```

  **Always scope selectors to avoid ambiguity**: When text or elements appear multiple times on a page, use container selectors (dialog, main, nav, etc.) or more specific role-based selectors to target the exact element needed.

- **Follow existing patterns in the codebase**: Before writing new test logic, search for similar functionality in existing tests and use the same patterns:

  ```bash
  # Search for existing patterns
  grep -r "Success.*toBeVisible" playwright/tests/
  grep -r "confirmAndAssertDeletion" playwright/tests/
  ```

  Example: Use `{ exact: true }` for Success messages as established in job-template-utils.ts

- **Use existing Playwright commands**: Always check `/playwright/commands/` for existing utilities before writing custom logic:

  ```typescript
  // GOOD - Use existing commands
  import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
  import { clickTableRow } from '../../../commands/clickTableRow';

  // Instead of writing custom deletion logic
  await clickTableRow({ filterLabel: 'Username', text: userName }, page);
  await clickPageAction('Delete user', page);
  await confirmAndAssertDeletion(page);
  ```

- **Create new Playwright commands for reusable patterns**: If you encounter a test flow that doesn't exist in `/playwright/commands/` but appears in Cypress tests or is needed by multiple tests, create a generic command:

  ```bash
  # Check Cypress commands for reference
  grep -r "clickToolbarKebabAction" cypress/support/
  grep -r "bulk.*delete" cypress/e2e/
  ```

  Example: Created `bulkDeleteResources` command for toolbar-based bulk deletion that can be reused across different resource types (users, teams, organizations, etc.)

- Prefer semantic selectors over CSS selectors:

  ```typescript
  // Good
  await page.getByRole('button', { name: 'Submit' }).click();

  // Avoid if possible
  await page.locator('#submit-btn').click();
  ```

- Use `data-testid` attributes for test-specific selectors (not `data-cy`):

  ```typescript
  // Preferred - use getByTestId helper
  await page.getByTestId('content-type').click();

  // Alternative - use locator with data-testid
  await page.locator('[data-testid="content-type"]').click();
  ```

#### Advanced Testing Patterns and Best Practices

##### API Response Interception for Dynamic Values

When dealing with resources that get dynamic names (timestamps, IDs, etc.), use API interception to capture exact values:

```typescript
// Set up API interception before triggering the action
const copyResponsePromise = page.waitForResponse(
  (response) => response.url().includes('/copy/') && response.status() === 201
);

// Trigger the copy action
await page.getByRole('menuitem', { name: 'Duplicate template' }).click();

// Get the exact copied name from the API response
const copyResponse = await copyResponsePromise;
const copiedResource = (await copyResponse.json()) as ResourceType;
const copiedName = copiedResource.name; // Use this for subsequent assertions and cleanup
```

This approach is superior to string manipulation or guessing patterns because:

- Captures exact API-generated values (timestamps, auto-incremented IDs, etc.)
- No flaky pattern matching
- Enables precise cleanup
- Mirrors how the UI actually receives the data

##### Testing Validation Logic: Prefer Hook-Level Tests

For form validation logic, test the validation hook directly rather than rendering the entire form:

```typescript
// GOOD - Test the hook directly (fast, reliable, focused)
import { renderHook } from '@testing-library/react';
import { useCredentialsValidate } from '../../hooks/useCredentialsValidate';

test('validates error when multiple credentials of same type selected', async () => {
  const { result } = renderHook(() => useCredentialsValidate(false));
  const validateFn = result.current;
  const selectedCredentials = [credential1, credential2]; // Both machine type
  
  const errorMessage = await validateFn(selectedCredentials);
  
  expect(errorMessage).toBe('Cannot assign multiple credentials of the same type...');
});

// AVOID - Rendering full form for validation testing (slow, complex, brittle)
// Only use full form rendering when testing UI interactions, not validation logic
```

Benefits of hook-level testing:

- Faster execution (milliseconds vs seconds)
- Avoids React concurrent rendering issues
- Tests the actual validation logic in isolation
- No need to mock entire component tree
- More maintainable and focused

**Important Trade-off:**

Hook-level tests are essentially unit tests. They validate the logic but miss integration aspects:

- Whether the hook is wired up correctly to the form field
- Whether errors display in the correct location in the UI
- Whether the form properly blocks submission on validation errors

For comprehensive coverage, combine hook-level tests with:

- Integration tests (Playwright) that test the full workflow with a live backend
- Cypress component tests if React rendering issues prevent Vitest component tests
- Manual testing for critical validation scenarios

##### Handling Strict Mode Violations with Exact Matching

When elements share similar text (e.g., "Template Name" and "Template Name @ timestamp"), always use `exact: true`:

```typescript
// GOOD - Prevents matching both "Job Template" and "Job Template @ 13:45:38"
await page.getByRole('checkbox', { name: 'Job Template', exact: true }).click();
await page.getByRole('link', { name: jobTemplateName, exact: true }).click();

// AVOID - Will match multiple elements if similar names exist
await page.getByRole('checkbox', { name: 'Job Template' }).click();
```

Apply this in utility commands too:

```typescript
// In filterTableBySelect.ts
await page.getByRole('checkbox', { name, exact: true }).click();
```

##### Cleanup Strategies for Duplicated Resources

When testing copy/duplicate functionality, clean up using specific filtering:

```typescript
// Strategy 1: Delete each resource individually using exact names
await deleteJobTemplate(originalName, page);
await deleteJobTemplate(copiedName, page); // copiedName from API response

// Strategy 2: Use bulk delete with search filter (if both have unique common text)
await filterTable({ filterLabel: 'Search', filterValue: uniquePrefix, clearFilters: true }, page);
await page.getByLabel('Select all', { exact: true }).click();
await page.getByLabel('toolbar actions').click();
await page.getByRole('menuitem', { name: 'Delete templates' }).click();
```

#### Common Test Utilities

Located in `/playwright/commands/`:

- `setupBefore()` / `setupAfter()` - Test setup and teardown
- `navigateTo()` - Navigate to specific pages
- `getTableRow()` - Find and filter table rows (handles pagination automatically)
- `clickTableRow()` - Interact with table rows
- `clickPageAction()` - Click page action buttons
- `login()` - Handle authentication
- `createE2EName()` - Generate unique test names
- `confirmAndAssertDeletion()` - Handle deletion confirmations
- `bulkDeleteResources()` - Generic bulk deletion from list view
- `deleteResourceFromDetailsPage()` - Generic deletion from details page
- `deleteResourceFromList()` - Generic deletion from list view

#### Test Tags

- `@not_mock` - Don't run against mocked data
- `@not_live` - Don't run against live server

#### Table Row Selection - CRITICAL RULE

**ALWAYS use the `getTableRow` utility** for table interactions:

```typescript
import { getTableRow } from '../../../commands/getTableRow';

// Correct approach
const roleRow = await getTableRow(page, roleName);
await roleRow.click();

// NEVER do this - will fail due to pagination
const roleRow = page.getByRole('row').filter({ hasText: roleName });
```

The `getTableRow` command automatically:

- Clears existing table filters
- Applies filter for specified text
- Returns visible table row
- Handles pagination correctly

#### Test Validation Requirement - CRITICAL

**ALWAYS run Playwright tests after creating or updating them** to ensure they pass before considering the work complete. This is mandatory for all test development.

```bash
# Run specific test file (fail-fast mode)
cd playwright && npx playwright test tests/path/to/your/test.spec.ts --project 'live chromium' --max-failures=1 --retries=0

# Run all tests in a directory (fail-fast mode)
cd playwright && npx playwright test tests/access-management/users/ --project 'live chromium' --max-failures=1 --retries=0

# Run with debug mode if tests fail
cd playwright && npx playwright test tests/path/to/your/test.spec.ts --project 'live chromium' --debug
```

**Fail-Fast Testing Strategy**: Use `--max-failures=1` to stop execution after the first failure and `--retries=0` to disable retries for immediate feedback. This enables immediate analysis and fixing rather than waiting for all tests to complete. After applying a fix, re-run tests to validate the solution.

**CRITICAL RULE**: Never conclude test development work or mark tasks as completed until ALL tests pass successfully AND all linting/TypeScript issues are resolved. Always run tests and check for linting issues as the final validation steps before considering any test work complete.

This ensures:

- Tests are syntactically correct and execute without errors
- Selectors work correctly with the actual UI
- Test logic functions as intended
- No regressions are introduced

### Debugging Tests

#### Using Playwright Inspector

```bash
npx playwright test --debug
```

#### Using Playwright MCP Server (AI Code Integration)

When debugging test failures, AI coding assistants can use the Playwright MCP server to:

- Navigate to live applications and examine actual UI structure
- Take screenshots and snapshots of pages
- Interact with UI elements to understand behavior
- Debug selector issues by testing elements in real-time
- Verify form interactions and data flows

**Browser Navigation Setup for AAP:**

1. Navigate to `https://localhost:4100` (always use HTTPS)
2. Handle SSL certificate warning:
   - Click "Advanced" button
   - Click "Proceed to localhost (unsafe)" link
3. Login with credentials from `/playwright/.env` file
   - Default admin username: `admin`
   - Default admin password: `Admin!Password!Gw`

**Test Development Methodology:**
Before writing any Playwright test, use the MCP server to:

1. **Manual Workflow Validation**: Navigate through the complete user workflow manually
2. **Selector Discovery**: Identify exact selectors for each UI element by examining snapshots
3. **Interaction Verification**: Test each interaction step (clicks, form fills, etc.)
4. **State Validation**: Verify expected page states after each action
5. **API Response Inspection**: Capture dynamic values (IDs, timestamps) from API responses
6. **Write Confident Tests**: Build tests using verified selectors and workflows

This approach is similar to using Playwright's record feature but provides more control and understanding.

**Real-world example from job template copy tests:**

- Used MCP to discover that the Name filter opens a dropdown with checkboxes, not a simple text input
- Identified that copied templates get dynamic timestamps (e.g., "Template @ 13:45:38")
- Tested API interception to capture exact copied names instead of guessing patterns
- This prevented multiple test rewrites and ensured tests worked on first run

This is particularly useful for:

- Understanding why selectors fail in tests
- Discovering the actual DOM structure vs expected structure
- Testing new UI features before writing tests
- Debugging complex user workflows
- Finding correct selectors instead of guessing
- Building tests that work reliably from the first run

#### Viewing Test Reports

```bash
# View coverage
npm run coverage
```

#### Common Issues and Solutions

- **Strict mode violations**: Use `exact: true` for precise element matching
- **Timeouts**: Increase timeout for slow operations or use `test.setTimeout()`
- **Element not found**: Check if elements are loaded, use proper wait strategies
- **Authentication issues**: Verify environment variables in `.env` file
- **Selector failures**: Use MCP server tools to examine actual UI structure
- **Table row selection**: Always use `getTableRow()` utility for paginated tables

### Test Environment Setup

1. Ensure your local UI is running on the configured port (default: 4100)
2. Set up proper authentication credentials in `.env`
3. For live tests, ensure backend services are accessible
4. For mock tests, mocking is handled automatically

### Coverage and Reporting

- Coverage reports are generated automatically during test runs
- Screenshots and videos are captured on test failures
- Traces can be viewed with `npx playwright show-trace trace.zip`
- Test artifacts are stored in `test-results/` directory

## Environment Setup

### Required Environment Variables

```bash
# Platform server URL
export PLATFORM_SERVER='https://localhost:443'

# For standalone services (if needed)
export AWX_SERVER='https://localhost:8043'
export EDA_SERVER='http://localhost:8000'
export HUB_SERVER='http://localhost:5001'

# API prefixes
export AWX_API_PREFIX='/api/controller/v2'
export EDA_API_PREFIX='/api/eda/v1'
export HUB_API_PREFIX='/api/galaxy'
```

### Prerequisites

- Node.js 20.x or higher
- NPM 8.x or higher

## Common Development Tasks

### Adding New Features

1. Identify the appropriate workspace (platform, awx, eda, hub, etc.)
2. Create components in the relevant workspace
3. Use shared framework components when possible
4. Add tests for new functionality
5. Update translations if needed

### Working with Forms

- Use React Hook Form with the framework's form components
- Leverage existing form validation patterns
- Follow the PageForm patterns in the framework

### API Integration

- Use the appropriate API utilities for each service
- Follow existing patterns for error handling
- Use SWR for data fetching and caching

### Testing New Code

```bash
# Run all tests
npm test

# Run tests for specific workspace
cd frontend/awx && npm test

# Run Cypress E2E tests
npm run e2e:run

# Run Playwright tests
cd playwright && npm run live    # Against live server
cd playwright && npm run mock    # Against mocked data

# Run specific Playwright test
cd playwright && npx playwright test tests/path/to/test.spec.ts --project 'live chromium'
```

### Playwright Test Guidelines

#### Table Row Selection

When writing Playwright tests that need to select rows from tables, **always use the `getTableRow` command** instead of manually filtering table rows. This command automatically handles table filtering which is essential because:

- Tables often contain many rows that are paginated
- Without filtering, the desired row may not be visible on the current page
- Manual row selection without filtering causes test failures

**Correct approach:**

```typescript
import { getTableRow } from '../../../commands/getTableRow';

// Use getTableRow to find and filter for a specific row
const roleRow = await getTableRow(page, roleName);
await roleRow.click();
```

**Avoid this pattern:**

```typescript
// DON'T do this - may fail if row is not visible due to pagination
const roleRow = page.getByRole('row').filter({ hasText: roleName });
```

The `getTableRow` command:

1. Automatically clears existing table filters
2. Applies a filter for the specified text
3. Returns the table row containing that text
4. Ensures the row is visible before any further actions

## Troubleshooting

### Common Issues

- **Build errors**: Run `npm run clean` then `npm ci`
- **Type errors**: Check TypeScript configuration in relevant workspace
- **Test failures**: Ensure all dependencies are installed and up to date
- **E2E test failures**: Check environment variables and server connectivity
- **Playwright test failures**:
  - Verify UI server is running on correct port (default: 4100)
  - Check `/playwright/.env` for correct credentials
  - Use `exact: true` for selector specificity issues
  - Run with `--debug` flag to investigate issues
  - Use AI coding assistant's Playwright MCP server to examine live UI structure and debug selectors
  - Always use `getTableRow()` utility for table interactions to handle pagination

### Log Access

- Platform logs: Check platform server logs
- Development logs: Check browser console and terminal output
- Test logs: Check test output and Cypress/Playwright reports
- Playwright traces: Use `npx playwright show-trace trace.zip` to debug test failures

## AI Assistant Guidelines

### Code Quality Standards

- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write descriptive test names
- Add comments only for complex logic, avoid obvious comments
- Ensure proper error handling

### Test Development Methodology - CRITICAL

**ALWAYS validate workflows manually before writing tests** using available browser automation tools:

1. **Manual Workflow Validation**: Navigate through the complete user workflow manually
2. **Selector Discovery**: Identify exact selectors for each UI element by examining snapshots
3. **Interaction Verification**: Test each interaction step (clicks, form fills, etc.)
4. **State Validation**: Verify expected page states after each action
5. **API Response Inspection**: Identify dynamic values that need to be captured from API responses
6. **Write Confident Tests**: Build tests using verified selectors, workflows, and API interception
7. **Run Tests**: Execute tests as final validation (should pass on first run)

This prevents the cycle of: write test → run test → fix selector → repeat.

**Key patterns discovered through MCP validation:**

- Filter dropdowns may use checkboxes with "Search input" instead of simple text inputs
- Dynamic values (timestamps, auto-generated names) require API response interception
- Always verify exact element types (textbox vs button vs dropdown) before writing selectors
- Use `exact: true` when similar names might exist (e.g., "Name" and "Name @ timestamp")

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
- Follow established patterns in the codebase
