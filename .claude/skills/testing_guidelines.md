# Testing Guidelines

Testing standards for this project. Read this skill before writing or reviewing
any **Vitest** unit/component test file.

For **Playwright E2E** (write, run, or debug), read
`.claude/skills/frontend-playwright-e2e/SKILL.md` instead.

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

For validation logic, prefer hook-level tests with `renderHook` over rendering a
full form.

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

Cover the happy path, error states, edge cases, and user interactions. Remove
obvious comments from test files.

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
