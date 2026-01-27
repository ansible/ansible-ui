# Migrate Cypress Test to Playwright

You are migrating a Cypress test to Playwright. Follow this workflow exactly to ensure accuracy and completeness.

## CRITICAL: Branch from Main

**ALWAYS create your migration branch from `main`, never from backport or feature branches.**

```bash
git checkout main
git checkout -b migrate-[feature]-tests
```

This ensures:
- Cypress test files exist and can be deleted
- Clean commit history
- Proper base for pull requests

## Parallel Migration Strategy

When migrating multiple related tests:

**Optimal batch size: 3-4 tests at once**
- Balances speed with manageability
- Allows for effective debugging if issues arise
- Avoids overwhelming the system

**For larger batches:**
- 5 tests: Run 3, then 2
- 6-8 tests: Run 3-4, then the remainder
- 9+ tests: Run in groups of 3-4

**Process:**
1. Launch parallel Task agents (one per test file)
2. Each agent completes full migration workflow
3. Verify all tests pass together before committing
4. Commit all migrations in a single commit

## Step 1: Read and Analyze Cypress Test

Read the Cypress test file provided by the user. Analyze:
- What feature is being tested
- What API resources are needed (org, team, user, inventory, etc.)
- What UI interactions are performed
- What assertions are made
- What cleanup is needed

## Step 2: Determine Target Location

Based on the test path and service:
- **AWX tests**: `playwright/tests/integration/automation-execution/[category]/[feature]/`
- **EDA tests**: `playwright/tests/integration/automation-decisions/[category]/[feature]/`
- **Hub tests**: `playwright/tests/integration/automation-content/[category]/[feature]/`
- **Platform tests**: `playwright/tests/integration/access-management/[category]/[feature]/`

Create the target directory if it doesn't exist.

## Step 3: Browser Validation (When Needed)

**When to use browser validation:**
- You're unfamiliar with the UI workflow
- Strong utility functions (e.g., `EdaCredential.ui.create()`) do NOT exist
- The Cypress test uses complex or unclear selectors

**When to skip browser validation:**
- Strong utility functions exist that handle the entire workflow
- The test primarily uses API-based setup/teardown
- You've already migrated similar tests in the same area

**If browser validation is needed:**

1. Navigate to https://localhost:4100 (handle SSL warning)
2. Login with credentials from `/playwright/.env`
3. Navigate through the exact UI flow that the test will perform
4. Use `browser_snapshot` to capture exact selectors for:
   - Navigation elements
   - Form fields
   - Buttons
   - Table rows
   - Dialog elements
5. Document the exact selector patterns found
6. Verify the complete workflow works manually

## Step 4: Identify Required Utilities

Check if utilities exist in `playwright/utils/`:
- Resource utilities (Organization, Team, User, Inventory, etc.)
- Command utilities in `playwright/commands/` (clickTableRow, filterTable, etc.)
- If utilities are missing, note what needs to be created

## Step 5: Write Playwright Test

Using the verified selectors from Step 3, write the Playwright test following these patterns:

### Required Structure

```typescript
import { expect, test } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
// Import other utilities as needed from '@ansible/playwright/utils'

test.beforeEach(setupBefore({ path: '/exact/path/from/navigation' }));
test.afterEach(setupAfter);

test.describe('Service - Feature - Operation', () => {
  test('should [action being tested]', { tag: ['@not_mock'] }, async ({ page }) => {
    // Setup resources via API for speed
    const resource = await Resource.api.create(page);

    try {
      await test.step('Descriptive step name', async () => {
        // Test code using VERIFIED selectors from browser validation
        // Use data-testid preferentially
        // Use exact: true for text matching when needed
      });

      await test.step('Another step', async () => {
        // More test code
      });
    } finally {
      // Cleanup in reverse order of creation
      await Resource.api.delete(page, resource.id);
    }
  });
});
```

### Critical Requirements

1. **setupBefore MUST include path**: `setupBefore({ path: '/exact/path' })`
2. **Use data-testid**: `page.getByTestId('element-name')` (NOT data-cy)
3. **Use verified selectors** from browser validation
4. **Use existing utilities**:
   - `clickTableRow({ filterLabel: 'Name', text: name }, page)` for table interactions
   - `getTableRow(page, text)` when you need the row locator
   - `navigateTo(page, 'Service', 'Page')` for navigation
   - `filterTable({ filterLabel, filterValue }, page)` for filtering
5. **Use test.step()** for readability and debugging
6. **Cleanup in finally block** to ensure cleanup even on failure
7. **Use API for setup/teardown** (faster than UI)
8. **Use exact: true** when similar text exists: `getByRole('button', { name: 'Submit', exact: true })`
9. **Scope selectors** to containers when elements appear multiple times: `page.locator('dialog').getByText('Success')`

### Common Patterns

**Table Row Interaction:**
```typescript
// CORRECT - uses utility that handles pagination
await clickTableRow({ filterLabel: 'Name', text: resourceName }, page);

// NEVER do this - fails with pagination
const row = page.getByRole('row').filter({ hasText: resourceName });
```

**API Response Interception:**
```typescript
const responsePromise = page.waitForResponse(
  (response) => response.url().includes('/api/path/') && response.status() === 201
);

await page.getByTestId('submit-button').click();

const response = await responsePromise;
const data = await response.json();
const generatedName = data.name; // Use for cleanup
```

**Form Filling:**
```typescript
await page.getByTestId('name').fill(name);
await page.getByTestId('description').fill(description);

// For dropdowns
await page.locator('#dropdown-id').click();
await page.getByLabel('Search input').fill(searchTerm);
await page.getByRole('option', { name: optionName }).click();
```

## Step 6: Run Test Immediately

Run the test with fail-fast mode:

```bash
cd playwright && npx playwright test tests/path/to/test.spec.ts --project 'live chromium' --max-failures=1 --retries=0
```

## Step 7: Fix Any Errors

If the test fails:
1. Read the error message carefully
2. Check the trace: `npx playwright show-trace trace.zip`
3. Use browser MCP to verify the selector is correct
4. Fix the issue
5. Run again
6. Repeat until test passes

**DO NOT mark the migration complete until the test passes.**

## Step 8: Verify Linting and TypeScript

```bash
npm run eslint
npm run tsc
```

Fix any errors before proceeding.

## Step 9: Delete Cypress Test (If Applicable)

Once the Playwright test is verified:
1. Delete the original Cypress test file
2. Delete corresponding Cypress component test if it exists

## Step 10: Create Commit

Create a well-formed commit:

```bash
git add playwright/tests/integration/path/to/test.spec.ts
git add cypress/e2e/path/to/test.cy.ts  # if deleting
git commit -m "[TICKET-ID] Migrate [Feature] Tests to Playwright

- Convert Cypress test to Playwright
- Add proper setupBefore with path parameter
- Use data-testid selectors
- Implement proper cleanup in finally blocks
- All tests passing

Test results: ✓ [number] tests passing"
```

## Common Migration Patterns

### Cypress → Playwright Selector Mapping

| Cypress | Playwright |
|---------|------------|
| `cy.get('[data-cy="name"]')` | `page.getByTestId('name')` |
| `cy.contains('Submit')` | `page.getByRole('button', { name: 'Submit' })` |
| `cy.get('input[name="email"]')` | `page.getByRole('textbox', { name: 'Email' })` |
| `cy.get('table').contains('row')` | `await getTableRow(page, 'row')` |

### Cypress → Playwright Action Mapping

| Cypress | Playwright |
|---------|------------|
| `cy.visit('/path')` | `await navigateTo(page, 'Service', 'Page')` |
| `cy.type('text')` | `await page.getByTestId('field').fill('text')` |
| `cy.click()` | `await page.getByTestId('button').click()` |
| `cy.select('option')` | See form dropdown pattern above |
| `cy.wait('@api')` | `await page.waitForResponse(...)` |

### Import Pattern Mapping

| Cypress | Playwright |
|---------|------------|
| `import { awxAPI } from '../../../api/awx'` | `import { Inventory } from '@ansible/playwright/utils'` |
| Individual utilities | `import { Organization, Team, User } from '@ansible/playwright/utils'` |
| Hub-specific | `import { Remote } from '@ansible/playwright/utils/hub'` |

## Common Pitfalls and Solutions

### Pitfall #1: Strict Mode Violations (Most Common Error)

**Problem:** Selector resolves to multiple elements
```
Error: locator.click: Error: strict mode violation: getByText('Container Registry') resolved to 2 elements
```

**Solution:** Scope selectors to specific containers or use data-testid
```typescript
// BAD - resolves to multiple elements
await page.getByText('Container Registry').click();

// GOOD - scoped to specific testid
await expect(page.getByTestId('credential-type')).toContainText('Container Registry');

// GOOD - scoped to dialog
await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();

// GOOD - scoped to footer
await page
  .getByRole('dialog')
  .getByRole('contentinfo')
  .getByRole('button', { name: 'Close' })
  .click();
```

**Prevention:**
- Always use `getByTestId()` when available
- Scope to containers: `dialog`, `main`, `nav`, `contentinfo`, `banner`
- Use `exact: true` when similar text exists
- Test in environment with multiple similar elements

### Pitfall #2: Incorrect API Payload Structure

**Problem:** API returns 400 with field errors
```
Expected status 201 but got 400. Response: {"eda_credential_id":["This field is required."]}
```

**Solution:** Check Cypress commands for exact payload structure
```typescript
// Check cypress/support/commands.ts for API structure
// Look for createBasicEventStream, createEdaCredential, etc.

// Example from Cypress commands:
Cypress.Commands.add('createBasicEventStream', (name) => {
  cy.requestPost('/api/eda/v1/event-streams/', {
    name: name,
    event_stream_type: 'basic',
    eda_credential_id: credentialId,  // NOT credential_id!
    organization_id: 1,
  });
});

// Use exact same structure in Playwright:
const eventStream = await edaAPI.post(page, '/event-streams/', {
  name: eventStreamName,
  event_stream_type: 'basic',
  eda_credential_id: credentialId,  // Correct field name
  organization_id: 1,
});
```

**Prevention:**
- Check `cypress/support/commands.ts` for API examples
- Grep for existing API calls: `grep -r "edaAPI.post" playwright/`
- Verify field names match API expectations
- Test with actual API before writing full test

### Pitfall #3: TypeScript Type Errors with API Responses

**Problem:** Variable typed as `unknown` or used before assignment
```
'credential' is of type 'unknown'
Variable 'projectId' is used before being assigned
```

**Solution:** Add type assertions and optional types
```typescript
// BAD - no type assertion
const credential = await edaAPI.post(page, '/eda-credentials/', payload);
credentialId = credential.id; // Error: 'credential' is of type 'unknown'

// GOOD - with type assertion
const credential = (await edaAPI.post(page, '/eda-credentials/', payload)) as {
  id: number;
};
credentialId = credential.id; // Works!

// BAD - used before assignment in finally block
let projectId: number;
try {
  const project = await edaAPI.post(...);
  projectId = project.id;
} finally {
  await edaAPI.delete(page, `/projects/${projectId}/`); // Error!
}

// GOOD - optional type allows undefined
let projectId: number | undefined;
try {
  const project = (await edaAPI.post(...)) as { id: number };
  projectId = project.id;
} finally {
  if (projectId) {
    await edaAPI.delete(page, `/projects/${projectId}/`);
  }
}
```

**Prevention:**
- Always type assert API responses: `as { id: number }`
- Use optional types for cleanup variables: `number | undefined`
- Check for undefined before using in finally blocks
- Run `npm run tsc` frequently during development

### Pitfall #4: Wrong credential_type_id or Resource ID

**Problem:** API returns validation errors for missing required fields
```
Expected status 201 but got 400. Response: {"inputs.host":["Cannot be blank"]}
```

**Solution:** Verify credential type IDs and resource IDs
```typescript
// Check existing tests or Cypress commands for correct IDs
// Example: Basic Event Stream credential_type_id is 7, not 4

// BAD - wrong credential type
const credential = await edaAPI.post(page, '/eda-credentials/', {
  credential_type_id: 4, // Wrong! This requires different fields
  ...
});

// GOOD - correct credential type
const credential = await edaAPI.post(page, '/eda-credentials/', {
  credential_type_id: 7, // Basic Event Stream
  inputs: {
    username: 'testuser',
    password: 'testpass',
  },
});
```

**Prevention:**
- Check Cypress commands for credential_type_id values
- Look at existing Playwright tests for the same credential type
- Grep for credential type names: `grep -r "Basic Event Stream" cypress/`
- Test API call separately before integrating into test

## Success Criteria

Before marking the migration complete, verify:

- [ ] Browser MCP validation completed (if needed for complex workflows)
- [ ] Test file created in correct location
- [ ] setupBefore includes path parameter
- [ ] All selectors use data-testid or semantic roles
- [ ] Selectors scoped to containers to avoid strict mode violations
- [ ] Utilities used correctly (clickTableRow, getTableRow, etc.)
- [ ] test.step() used for all major test sections
- [ ] API used for setup/teardown with proper TypeScript types
- [ ] API responses type asserted: `as { id: number }`
- [ ] Cleanup variables use optional types: `number | undefined`
- [ ] Cleanup in finally blocks with undefined checks
- [ ] Test runs and PASSES (with `--max-failures=1 --retries=0`)
- [ ] No linting errors (`npm run eslint`)
- [ ] No TypeScript errors (`npm run tsc`)
- [ ] Cypress test deleted (if applicable)
- [ ] Commit created with proper message

## Notes

- If you encounter missing utilities, create them following existing patterns
- If you find anti-patterns (waitForTimeout, data-cy, etc.), replace them
- If the Cypress test has obvious bugs, fix them in the Playwright version
- Document any deviations from this workflow in the commit message
