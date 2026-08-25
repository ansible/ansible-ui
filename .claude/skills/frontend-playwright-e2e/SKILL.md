---
name: frontend-playwright-e2e
description: >
  How to write Playwright E2E tests: fixtures, isolation, accessible locators,
  cleanup. Use when authoring or reviewing E2E. For launching tests use
  frontend-run-e2e. Ports, commands, and helpers are in frontend-overlay.
---

# Playwright E2E (portable)

Default to Vitest. Use E2E for cross-route journeys, real layout, or live API.
Read `.claude/skills/frontend-overlay/SKILL.md` for this repo’s fixture path,
commands, and base URL.

## Conventions

- Import `test` / `expect` as the overlay specifies (this repo: `@playwright/test`)
- Locators: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` >
  `getByTestId`
- Unique data: overlay unique-name helper — never collide on shared DBs
- Create every resource the test needs; delete in `try/finally` or overlay teardown
- `test.skip` only when data **cannot** be created programmatically
- No `waitForTimeout`. No `dispatchEvent` to fake UI. No locator `.first()` as
  a substitute for a unique role/name
- Web-first assertions (`toBeVisible`, `toHaveURL`)

## Isolation

```ts
test('user creates an item', async ({ page }) => {
  const name = createE2EName('e2e')
  try {
    await page.goto('/items')
    await page.getByRole('button', { name: 'Create item' }).click()
    await page.getByRole('textbox', { name: 'Name' }).fill(name)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('row', { name: new RegExp(name) })).toBeVisible()
  } finally {
    // overlay cleanup helper
  }
})
```

## Dual mode (if the app has a mock API)

| Mode | When |
| --- | --- |
| Mock UI via Playwright | Local / tagged tests overlay allows |
| Real backend | Live project; skip tests that need mock-only seed (`@not_mock` here) |

Cleanup is mandatory against a real DB.

## Visual regression

If the app has visual specs: new representative pages get a spec + baseline.
Do not block PRs on full-page screenshots (on-demand + weekly backstop). See overlay.
