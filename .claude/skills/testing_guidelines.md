# Testing Guidelines

Testing standards for this project. Read this skill before writing or reviewing
any test file (Vitest **and** Playwright).

- **Vitest** (unit/component): sections below through Quick Reference.
- **Playwright E2E**: Playwright Testing section. To **launch** a run without
  printing secrets, also read `.claude/skills/frontend-run-e2e/SKILL.md`.
  Ports, env file, and commands: `.claude/skills/frontend-overlay/SKILL.md`.

---

## Test Stack

- **Vitest 3.2+** — test runner (not Jest)
- **MSW 2.7+** — HTTP-level API mocking (`msw/node`)
- **Testing Library** — `@testing-library/react` for rendering, `@testing-library/user-event` for interaction
- **SWR** — data fetching (tests must account for caching)
- **react-i18next** — auto-mocked by `vitest.setup.ts`
- **Test environment**: `happy-dom` (configured in each workspace's `vite.config.ts`)

---

## Test Setup — Already Handled

Each workspace has a `vitest.setup.ts` that calls:

```typescript
import '@testing-library/jest-dom/vitest';
import { mockI18n, enablePreview } from './vitest.common';
mockI18n();     // Mocks react-i18next globally — t() returns the key string
enablePreview(); // Captures DOM snapshot on test failure via vitest-preview
```

You do NOT need to mock i18n in individual test files. The `mockI18n()` function
makes `t('Some text')` return `'Some text'` — the key itself. Template
variables like `t('Hello {{name}}', { name: 'World' })` interpolate correctly.

Source: `framework/vitest.setup.ts`, `framework/vitest.common.ts`

---

## MSW Server Setup Pattern

Mock API endpoints at the HTTP level with MSW — **never mock `requestGet`,
`usePostRequest`, or other CRUD functions directly**.

```typescript
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from './api/awx-utils';

const server = setupServer(
  // GET — return paginated list
  http.get(awxAPI`/credentials/`, () =>
    HttpResponse.json({ count: 2, results: [credential1, credential2] })
  ),

  // GET — return single item
  http.get(awxAPI`/feature_flags_state/`, () =>
    HttpResponse.json({ MY_FLAG: true })
  ),

  // POST — create
  http.post(awxAPI`/users/`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 1, ...body }, { status: 201 });
  }),

  // OPTIONS — for useOptions / dynamic filters
  http.options(awxAPI`/credentials/`, () =>
    HttpResponse.json({ actions: { GET: { name: { filterable: true } } } })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### `onUnhandledRequest` options

| Value     | Use when                                                |
| --------- | ------------------------------------------------------- |
| `'warn'`  | Default — logs unhandled requests but doesn't fail      |
| `'error'` | Strict — fails test on any unmocked API call            |
| `'bypass'`| Permissive — silently passes through unhandled requests |

### Override handlers in individual tests

```typescript
it('should show error on API failure', async () => {
  server.use(
    http.get(awxAPI`/users/`, () => HttpResponse.json({}, { status: 500 }))
  );
  // ... render and assert error state
});
```

Source: `frontend/awx/common/useFeatureFlags.test.tsx`

---

## Rendering Components

### Simple component (no route params)

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter>
    <MyComponent />
  </MemoryRouter>
);
```

### Component that reads route params (useParams)

```typescript
import { MemoryRouter, Route, Routes } from 'react-router-dom';

render(
  <MemoryRouter initialEntries={['/users/42/edit']}>
    <Routes>
      <Route path="/users/:id/edit" element={<EditUser />} />
    </Routes>
  </MemoryRouter>
);
```

### Component that uses react-hook-form context (FormProvider)

Some components expect to be inside a form context. Wrap with `FormProvider`:

```typescript
import { useForm, FormProvider } from 'react-hook-form';

function TestFormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { project: { id: 1, name: 'test' } } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

render(
  <MemoryRouter>
    <TestFormWrapper>
      <PageFormInventoryFileSelect />
    </TestFormWrapper>
  </MemoryRouter>
);
```

Source: `frontend/awx/resources/sources/component/PageFormInventoryFileSelect.test.tsx`

---

## Testing Hooks

### Basic hook test with MSW

```typescript
import { renderHook, waitFor } from '@testing-library/react';

it('should return feature flags from API', async () => {
  const { result } = renderHook(() => useFeatureFlags());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });

  expect(result.current.data?.MY_FLAG).toBe(true);
});
```

### Hook test with timeout (for slow or complex hooks)

```typescript
await waitFor(() => {
  expect(result.current).toBeDefined();
}, { timeout: 10000 });
```

### Hooks that read OPTIONS response

```typescript
const server = setupServer(
  http.options(awxAPI`/credentials/`, () =>
    HttpResponse.json({
      actions: { GET: { credential_type: { filterable: true, type: 'field' } } }
    })
  )
);

it('should generate filters from OPTIONS', async () => {
  const { result } = renderHook(() => useCredentialTypesFilters());
  await waitFor(() => {
    expect(result.current.length).toBeGreaterThan(0);
  }, { timeout: 10000 });
});
```

Source: `frontend/awx/access/credential-types/hooks/useCredentialTypesFilters.test.tsx`

---

## Mocking Modules with vi.mock

When you need to mock a module (not an API endpoint), use `vi.mock`:

```typescript
import { vi } from 'vitest';

// Mock a hook's return value
vi.mock('../../common/useAwxConfig', () => ({
  useAwxConfig: vi.fn(() => ({ license_info: { license_type: 'open' } })),
}));

// Mock with different values per test
import { useAwxConfig } from '../../common/useAwxConfig';
vi.mocked(useAwxConfig).mockReturnValueOnce({ license_info: { license_type: 'open' } });
```

**Prefer MSW over `vi.mock` for API calls.** Only use `vi.mock` for hooks,
context values, or browser APIs that cannot be intercepted via HTTP.

---

## Mock Fixture Patterns

Create structured mock data factories for reusable test data:

```typescript
// Helper function for paginated responses
const pageResponse = <T>(results: T[], next: string | null = null) => ({
  count: results.length,
  next,
  previous: null,
  results,
});

// EDA response format
const edaPageResponse = <T>(results: T[]) => ({
  count: results.length,
  results,
});

// Hub response format (Galaxy style)
const hubPageResponse = <T>(data: T[]) => ({
  meta: { count: data.length },
  data,
  links: { next: undefined },
});
```

---

## Query Priority

Use accessible queries in this priority order:

1. **`getByRole`** — best: semantic and accessible
2. **`getByLabelText`** — good for form fields
3. **`getByText`** — acceptable for static content
4. **`getByTestId`** — last resort only

```typescript
// Preferred
screen.getByRole('link', { name: /SSH.*My SSH Key/ });
screen.getByRole('button', { name: 'Submit' });
screen.getByRole('textbox', { name: 'Username' });

// Acceptable
screen.getByText('No credentials found');

// Last resort
screen.getByTestId('custom-widget');
```

Use `exact: true` when similar text exists (e.g., "Name" vs "Name @ timestamp").

---

## User Interaction

Always use `userEvent.setup()` — never `fireEvent`:

```typescript
import { userEvent } from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  await user.click(screen.getByRole('button', { name: 'Save' }));
  await user.type(screen.getByRole('textbox', { name: 'Name' }), 'New Name');

  expect(screen.getByText('Saved')).toBeInTheDocument();
});
```

---

## Async Assertions

Use `waitFor` for assertions on async data (SWR fetches, state updates):

```typescript
// Wait for content to appear
await waitFor(() => {
  expect(screen.getByText('Loaded content')).toBeInTheDocument();
});

// Wait for content to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

// With custom timeout for slow operations
await waitFor(() => {
  expect(result.current.data).toBeDefined();
}, { timeout: 15000 });
```

---

## AAA Pattern

Structure every test with Arrange, Act, Assert:

```typescript
it('should increment counter when button clicked', async () => {
  // Arrange
  const user = userEvent.setup();
  render(<Counter initialValue={0} />);

  // Act
  await user.click(screen.getByRole('button', { name: 'Increment' }));

  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

---

## Skipping Tests

Use `test.skip()` for tests that depend on data not always available:

```typescript
test.skip('should display audit details', () => {
  // Skipped until fixture data is seeded
});
```

Never commit `test.only()` — ESLint rule `no-only-tests` will catch it.

---

## What to Test

| Type          | Focus on                                            |
| ------------- | --------------------------------------------------- |
| **Component** | User interactions, conditional rendering, edge cases |
| **Hook**      | Return values, state transitions, error handling     |
| **Utility**   | Input/output transformations, boundary conditions    |
| **Form**      | Validation, field interactions, submit behavior      |

### What NOT to test

- Implementation details (internal state, private methods)
- Third-party library behavior (PatternFly, React Router)
- Static content that never changes
- React rendering lifecycle

---

## Vitest Configuration

Each workspace's `vite.config.ts` configures Vitest:

- **Environment**: `happy-dom` (faster than jsdom)
- **Setup file**: `vitest.setup.ts` (auto-mocks i18n, enables preview)
- **Inline deps**: PatternFly CSS, React Icons, React Topology (CSS/module resolution)
- **Coverage**: v8 reporter with json, lcov, text output

---

## Quick Reference

```typescript
// Core imports
import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// API helpers for MSW handlers
import { awxAPI } from '../../common/api/awx-utils';
import { edaAPI } from '../../common/eda-utils';
import { hubAPI } from '../../common/api/formatPath';

// Commands
// npm run vitest              — run all tests
// npm run vitest -- --watch   — watch mode
// npm run vitest-preview      — vitest UI
```

---

## Playwright Testing

Moved here from `CLAUDE.md` / `AGENTS.md`. Default to Vitest for unit/component work.
Use Playwright for integration, e2e, and live testing.

Begin Playwright test names with "should". Prefer editing existing specs and
reusing `playwright/commands/` over new helpers. Create a generic command when a
pattern repeats.

### Environment

Create `playwright/.env` (never commit secrets; never print values in chat):

```bash
PLATFORM_UI=http://localhost:4100
PLATFORM_USERNAME=your_username
PLATFORM_PASSWORD=your_password
```

Also used (overlay / shell):

```bash
export PLATFORM_SERVER='https://localhost:443'
# Standalone services if needed
export AWX_SERVER='https://localhost:8043'
export EDA_SERVER='http://localhost:8000'
export HUB_SERVER='http://localhost:5001'
```

Prerequisites: Node.js 20.x+, NPM 8.x+. Live UI is typically `https://localhost:4100`.

### Test structure

Always use at least one top-level `describe` block:

```typescript
import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '../../commands/setup';

test.beforeEach(setupBefore({ path: '/your/path' }));
test.afterEach(setupAfter);

test.describe('Feature Name - Description', () => {
  test('should do the user-visible thing', { tag: ['@not_mock'] }, async ({ page }) => {
    // test body
  });
});
```

### Test type guidelines

| Type | Meaning |
| --- | --- |
| **Unit** | Pure logic/functions, no DOM, mock dependencies, milliseconds (Vitest) |
| **Component** | Units together, mocked APIs, Vitest, UI/form behavior; don't mock unless necessary |
| **Integration** | Live API, no mocking; API interaction (RBAC, job execution, DB) |
| **User acceptance** | Full user flows spanning resources (create template → run job → verify output) |

### Critical Playwright rules

#### 1. Use `data-testid` (NOT `data-cy`)

```typescript
// BEST
await page.getByTestId('content-type').click();

// AVOID
await page.locator('[data-cy="content-type"]').click();
```

#### 2. Selector best practices

```typescript
await page.getByRole('textbox', { name: 'Name', exact: true }).fill('value');
await expect(page.locator('dialog').getByText('Success')).toBeVisible();
await page.getByRole('button', { name: 'Submit' }).click();
```

- `exact: true` when similar text exists (e.g. "Name" and "Name @ timestamp")
- Scope to containers (dialog, main, nav) when elements appear more than once
- Check `playwright/commands/` for utilities before writing custom logic
- Search existing tests: `rg "pattern" playwright/tests/`

#### 3. Table row selection — critical

Always use utilities in `playwright/commands/` when available. Tests may run where
data is paginated off screen. `clickTableRow()` / `getTableRow` filter so rows
are not flaky.

```typescript
import { getTableRow } from '../../../commands/getTableRow';

await clickTableRow({ filterLabel: 'Name', text: credentialTypeName }, page);

// NEVER — fails due to pagination
const roleRow = page.getByRole('row').filter({ hasText: roleName });
```

#### 4. API response interception for dynamic values

Capture API-generated values instead of guessing patterns:

```typescript
const copyResponsePromise = page.waitForResponse(
  (response) => response.url().includes('/copy/') && response.status() === 201
);

await page.getByRole('menuitem', { name: 'Duplicate template' }).click();

const copyResponse = await copyResponsePromise;
const copiedResource = (await copyResponse.json()) as ResourceType;
const copiedName = copiedResource.name;
```

#### 5. Validate after writing — critical

Always run the spec after creating/updating it:

```bash
cd playwright && npx playwright test tests/path/to/test.spec.ts --project 'live chromium' --max-failures=1 --retries=0

cd playwright && npx playwright test tests/path/to/test.spec.ts --project 'live chromium' --debug
```

Never conclude test work until all tests pass and lint/TypeScript issues are resolved.

Do not start a second UI if port 4100 is already bound. For launching without
dumping secrets, use `.claude/skills/frontend-run-e2e/SKILL.md`.

### Test development methodology

Validate workflows manually with browser automation (Playwright MCP) before writing tests:

1. Navigate the full user workflow
2. Identify selectors from snapshots
3. Test each interaction
4. Verify page state after actions
5. Identify dynamic values that need API interception
6. Write tests from verified selectors
7. Run tests as final validation

This avoids write → run → fix selector loops.

**Browser setup:**

1. Navigate to `https://localhost:4100` (HTTPS)
2. SSL warning: type `thisisunsafe` on the warning page, or Advanced → Proceed
3. Log in with `PLATFORM_USERNAME` / `PLATFORM_PASSWORD` from `playwright/.env`.
   Never print those values (including any default in the env file).

Playwright MCP hits the same SSL warning on `https://localhost:4100`. Bypass it
with `thisisunsafe` before interacting with the UI.

### Common test utilities

#### Generic commands (`playwright/commands/`)

- `setupBefore()` / `setupAfter()` — setup and teardown
- `navigateTo()` — navigate to pages
- `getTableRow()` — find table rows (handles pagination) — use for all table interactions
- `clickTableRow()` — interact with table rows
- `clickPageAction()` — page action buttons
- `login()` — authentication
- `createE2EName()` — unique test names
- `confirmAndAssertDeletion()` — deletion confirmations
- `bulkDeleteResources()` — bulk delete from list
- `deleteResourceFromDetailsPage()` / `deleteResourceFromList()` — generic deletes

#### Resource-specific utilities (`playwright/utils/`)

`Resource.api` / `Resource.ui` action pattern:

```typescript
import { Organization } from '@ansible/playwright/utils';

const org = await Organization.api.create(page, { name: 'Test Org' });
await Organization.api.delete(page, org.id);

await Organization.ui.create(page, { organizationName: 'Test Org' });
```

### Test tags

- `@not_mock` — do not run against mocked data
- `@visual` — visual regression (live-only; not a PR merge gate)

### Debugging

```bash
npx playwright test --debug
npx playwright show-trace trace.zip
npm run coverage
```

### Failures (troubleshooting)

- UI server on port 4100
- `playwright/.env` credentials present (do not print them)
- `exact: true` for selector specificity
- `--debug`
- `getTableRow()` for tables
- MCP snapshot of the live UI
- Traces: `npx playwright show-trace trace.zip`

Visual specs live under `playwright/tests/visual/`. Do not block PRs on full-page
screenshots (on-demand + weekly, live-only).
