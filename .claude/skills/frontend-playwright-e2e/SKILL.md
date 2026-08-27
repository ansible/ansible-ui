---
name: frontend-playwright-e2e
description: >
  Write, run, and debug Playwright E2E / integration / live tests. Use when
  writing or reviewing a *.spec.ts under playwright/, or when the user asks to
  run, execute, or debug E2E tests, or which env vars are required. Never print
  secrets. For Vitest unit/component tests, read testing_guidelines.md instead.
user-invocable: true
---

# Playwright E2E

Default to Vitest for unit/component work (see
`.claude/skills/testing_guidelines.md`). Use Playwright for integration, e2e,
and live testing. For ports, env file, and stack commands, read
`.claude/skills/frontend-overlay/SKILL.md`.

---

## Writing tests

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

Prerequisites: Node.js 20+ (`engines` in `package.json`). Live UI is typically `https://localhost:4100`.

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

Do not start a second UI if port 4100 is already bound. To launch a run without
dumping secrets, use the **Running tests** wizard below.

#### 6. Web-first assertions & auto-waiting

`expect(locator)` assertions auto-retry until they pass or time out, and
locator actions auto-wait for the element to be actionable. Rely on that — never
add manual sleeps.

```typescript
// GOOD — retries until the element appears / has the text
await expect(page.getByRole('heading', { name: 'Details' })).toBeVisible();
await expect(page.getByTestId('status')).toHaveText('Successful');

// AVOID — arbitrary sleep, flaky and slow
await page.waitForTimeout(3000);
expect(await page.getByTestId('status').textContent()).toBe('Successful');
```

Prefer `waitForResponse` (see rule #4) over `waitForTimeout` when you need to
wait for data.

#### Common anti-patterns

- **Hard sleeps** — `waitForTimeout()` to "let things settle". Use a web-first
  assertion or `waitForResponse` instead.
- **Manual retry/poll loops** — re-implementing what `expect(locator)` already
  does. Assert on the locator.
- **Reading then asserting** — `expect(await locator.textContent())` does not
  retry. Use `await expect(locator).toHaveText(...)`.
- **Asserting on detached elements** — after a navigation or re-render, re-query
  the locator; do not hold a stale handle.
- **Acting after navigation with no wait** — follow a navigation with a
  web-first assertion on the new page before interacting.

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

Visual specs live under `playwright/tests/visual/`. Do not block PRs on full-page
screenshots (on-demand + weekly, live-only).

---

## Running tests

When the user asks to run/execute/debug E2E, gather config with sensible
defaults. Confirm or override — do not make the user start from a blank form.

### Secrets

If the suite needs a password or token:

1. Never `cat` / `head` / print the secret file
2. Check existence with `test -f`
3. Pass via shell expansion only inside the command the user runs, not in chat
4. When previewing the command, show `$(grep …)` / env var names — never the value
5. If you accidentally read a secret, do not repeat it

### Wizard

1. Resolve repo root (`git rev-parse --show-toplevel`)
2. Overlay defaults: mock vs live, UI URL, grep / file path, headed?
3. Confirm with the user
4. Preflight: node, Playwright browsers, overlay "is the stack up?" checks
5. Run **one** command from overlay (`npm run live`, `npx playwright test …`)
6. Summarize: passed / failed / skipped. Do not dump full traces unless asked

Do not start a second copy of the UI if overlay says a server is already bound
to those ports.

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
