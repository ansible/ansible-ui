import { Page, request as pwRequest, test, expect } from '@playwright/test';

test.use({ ignoreHTTPSErrors: true });

const APP_HOST = process.env.APP_HOST ?? 'stage.foo.redhat.com:1337';
const HUB_PATH = process.env.HUB_PATH ?? '/ansible/automation-hub';
const HUB_URL = `https://${APP_HOST}${HUB_PATH}`;

async function disableCookiePrompt(page: Page) {
  await page.route('**/*', async (route, request) => {
    if (request.url().includes('consent.trustarc.com') && request.resourceType() !== 'document') {
      await route.abort();
    } else {
      await route.continue();
    }
  });
}

async function login(page: Page, user: string, password: string): Promise<void> {
  await expect(
    page.locator('text=Lockdown'),
    'Proxy config incorrect — got a lockdown page instead of SSO'
  ).toHaveCount(0);

  await page.getByLabel('Red Hat login').first().fill(user);
  await page.getByRole('button', { name: 'Next' }).click();

  const passwordField = page.getByLabel('Password').first();
  await expect(passwordField).toBeVisible({ timeout: 10_000 });
  await passwordField.fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByText('Invalid login')).not.toBeVisible();
}

async function loginAndNavigateToHub(page: Page) {
  await disableCookiePrompt(page);
  await page.goto(`https://${APP_HOST}`, { waitUntil: 'load', timeout: 60_000 });

  const onSSOPage = await page
    .locator('#username-verification')
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false);

  if (onSSOPage) {
    const user = process.env.E2E_USER!;
    const password = process.env.E2E_PASSWORD!;
    await login(page, user, password);
    await page.waitForLoadState('load');
    await expect(page.getByText('Invalid login')).not.toBeVisible();
    await page.waitForTimeout(5000);

    const acceptAllButton = page.getByRole('button', { name: 'Accept all' });
    if (await acceptAllButton.isVisible().catch(() => false)) {
      await acceptAllButton.click();
    }
  }

  try {
    await page.goto(HUB_URL, { waitUntil: 'load', timeout: 30_000 });
  } catch {
    await page.context().clearCookies();
    await page.goto(HUB_URL, { waitUntil: 'load', timeout: 30_000 });
  }
  await page.waitForTimeout(2000);
}

/**
 * Assert that the page did not render an error or 404 state.
 */
async function assertNoPageError(page: Page) {
  await expect(page.getByText('Something went wrong')).not.toBeVisible();
  await expect(page.getByText('Page Not Found')).not.toBeVisible();
}

/**
 * Navigate to a Hub sub-route by URL and wait for it to settle.
 */
async function navigateToHubRoute(page: Page, path: string) {
  try {
    await page.goto(`${HUB_URL}${path}`, { waitUntil: 'load', timeout: 30_000 });
  } catch {
    await page.context().clearCookies();
    await page.goto(`${HUB_URL}${path}`, { waitUntil: 'load', timeout: 30_000 });
  }
  await page.waitForTimeout(2000);
}

// ---------------------------------------------------------------------------
// Smoke tests — basic app bootstrap
// ---------------------------------------------------------------------------
test.describe('Hub Insights smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToHub(page);
  });

  test('should load automation hub page and render content', async ({ page }) => {
    await test.step('Verify page shell rendered', async () => {
      await expect(page.locator('h1, [data-ouia-page-type]').first()).toBeVisible({
        timeout: 15_000,
      });

      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    });

    await test.step('Verify no error state', async () => {
      await assertNoPageError(page);
    });
  });

  test('should navigate within automation hub without errors', async ({ page }) => {
    const partnersLink = page.getByRole('link', { name: /Partners|Namespaces/i }).first();
    if (await partnersLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await test.step('Click Partners/Namespaces link', async () => {
        await partnersLink.click();
        await page.waitForLoadState('load');
      });

      await test.step('Verify no error state', async () => {
        await assertNoPageError(page);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Insights-specific navigation & routing
// ---------------------------------------------------------------------------
test.describe('Hub Insights navigation and routing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToHub(page);
  });

  test.describe('Insights-specific route structure', () => {
    test('should serve task management at top-level /tasks', async ({ page }) => {
      await test.step('Navigate to /tasks', async () => {
        await navigateToHubRoute(page, '/tasks');
      });

      await test.step('Verify page loaded without errors', async () => {
        await assertNoPageError(page);
      });
    });

    test('should serve collection approvals at /approval-dashboard', async ({ page }) => {
      await test.step('Navigate to /approval-dashboard', async () => {
        await navigateToHubRoute(page, '/approval-dashboard');
      });

      await test.step('Verify page loaded without errors', async () => {
        await assertNoPageError(page);
      });
    });

    test('should serve signature keys at top-level /signature-keys', async ({ page }) => {
      await test.step('Navigate to /signature-keys', async () => {
        await navigateToHubRoute(page, '/signature-keys');
      });

      await test.step('Verify page loaded without errors', async () => {
        await assertNoPageError(page);
      });
    });

    test('should serve repositories under /ansible/repositories', async ({ page }) => {
      await test.step('Navigate to /ansible/repositories', async () => {
        await navigateToHubRoute(page, '/ansible/repositories');
      });

      await test.step('Verify page loaded without errors', async () => {
        await assertNoPageError(page);
      });
    });

    test('should serve remotes under /ansible/remotes', async ({ page }) => {
      await test.step('Navigate to /ansible/remotes', async () => {
        await navigateToHubRoute(page, '/ansible/remotes');
      });

      await test.step('Verify page loaded without errors', async () => {
        await assertNoPageError(page);
      });
    });

    test('should serve Connect to Hub page at /token', async ({ page }) => {
      await test.step('Navigate to /token', async () => {
        await navigateToHubRoute(page, '/token');
      });

      await test.step('Verify Connect to Hub page rendered', async () => {
        await assertNoPageError(page);
        await expect(page.getByRole('heading', { name: /Connect to Hub/i })).toBeVisible({
          timeout: 15_000,
        });
        await expect(
          page.getByRole('heading', { name: /Connect Private Automation Hub/i })
        ).toBeVisible();
        await expect(
          page.getByRole('heading', { name: /Connect the ansible-galaxy client/i })
        ).toBeVisible();
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Create namespace form — validates lazy-loaded DataEditor renders
// ---------------------------------------------------------------------------
test.describe('Hub Insights create namespace form', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToHub(page);
  });

  test('should render the create namespace form with DataEditor', async ({ page }) => {
    await test.step('Navigate to create namespace page', async () => {
      await navigateToHubRoute(page, '/partners/create');
    });

    await test.step('Verify no error state', async () => {
      await assertNoPageError(page);
    });

    await test.step('Verify form fields are visible', async () => {
      await expect(page.getByTestId('name')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId('company')).toBeVisible();
      await expect(page.getByTestId('description')).toBeVisible();
    });

    await test.step('Verify DataEditor (Monaco) loaded via lazy import', async () => {
      await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('.view-lines')).toBeVisible();
    });

    await test.step('Verify submit button is present', async () => {
      await expect(page.getByTestId('Submit')).toBeVisible();
    });
  });
});

// ---------------------------------------------------------------------------
// Features excluded from the Insights build
// ---------------------------------------------------------------------------
test.describe('Hub Insights excluded features', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToHub(page);
  });

  test.describe('Navigation items', () => {
    test('should not display Execution Environments link', async ({ page }) => {
      await expect(page.getByRole('link', { name: /Execution Environments/i })).not.toBeVisible({
        timeout: 5_000,
      });
    });

    test('should not display Access Management link', async ({ page }) => {
      await expect(page.getByRole('link', { name: /^Access Management$/i })).not.toBeVisible({
        timeout: 5_000,
      });
    });

    test('should not display Settings link', async ({ page }) => {
      await expect(page.getByRole('link', { name: /^Settings$/i })).not.toBeVisible({
        timeout: 5_000,
      });
    });
  });

  test.describe('Routes', () => {
    test('should not serve a standalone /administration route', async ({ page }) => {
      await test.step('Navigate to /administration', async () => {
        await navigateToHubRoute(page, '/administration');
      });

      await test.step('Verify administration section is not rendered', async () => {
        await expect(page.getByRole('heading', { name: /Signature Keys/i })).not.toBeVisible({
          timeout: 5_000,
        });
      });
    });
  });

  test.describe('Toolbar actions', () => {
    test('should not display bulk select checkboxes on collections list', async ({ page }) => {
      await test.step('Navigate to collections', async () => {
        const collectionsLink = page.getByRole('link', { name: /Collections/i }).first();
        if (await collectionsLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await collectionsLink.click();
          await page.waitForTimeout(2000);
        }
      });

      await test.step('Verify select-all checkbox is absent', async () => {
        await expect(page.locator('[data-cy="select-all"]')).not.toBeVisible({ timeout: 5_000 });
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Insights Chrome shell integration
// ---------------------------------------------------------------------------
test.describe('Hub Insights Chrome integration', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToHub(page);
  });

  test('should not render Hub standalone masthead', async ({ page }) => {
    await expect(page.locator('[data-cy="hub-masthead"]')).not.toBeVisible({ timeout: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// Hub API helpers for test fixture creation / cleanup.
// These require an authenticated SSO session (available in CI via the Chrome
// dev sidecar). Locally the dev server skips SSO, so API calls will fail and
// the Access tab tests fall back to graceful skipping.
// ---------------------------------------------------------------------------
const HUB_API = `https://${APP_HOST}/api/automation-hub`;
const PULP_API = `${HUB_API}/pulp/api/v3`;
const E2E_PREFIX = 'e2e_test_';

async function getCSRFToken(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === 'csrftoken')?.value ?? '';
}

function apiHeaders(csrfToken: string) {
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
  };
}

async function createTestNamespace(page: Page, name: string): Promise<boolean> {
  const csrf = await getCSRFToken(page);
  const res = await page.request
    .post(`${HUB_API}/_ui/v1/namespaces/`, {
      data: { name },
      headers: apiHeaders(csrf),
    })
    .catch(() => null);
  if (!res) return false;
  return res.status() === 201 || res.status() === 409;
}

async function createTestRepository(page: Page, name: string): Promise<string | null> {
  const csrf = await getCSRFToken(page);
  const res = await page.request
    .post(`${PULP_API}/repositories/ansible/ansible/`, {
      data: { name, retain_repo_versions: 1 },
      headers: apiHeaders(csrf),
    })
    .catch(() => null);
  if (res?.ok()) {
    const body = (await res.json()) as { pulp_href: string };
    return body.pulp_href;
  }
  return null;
}

async function createTestRemote(page: Page, name: string): Promise<string | null> {
  const csrf = await getCSRFToken(page);
  const res = await page.request
    .post(`${PULP_API}/remotes/ansible/collection/`, {
      data: { name, url: 'https://console.redhat.com/api/automation-hub/' },
      headers: apiHeaders(csrf),
    })
    .catch(() => null);
  if (res?.ok()) {
    const body = (await res.json()) as { pulp_href: string };
    return body.pulp_href;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Insights-specific unified Access tab
//
// In Insights mode, namespaces, repositories, and remotes show a single
// "Access" tab with Users + Groups sections instead of the standalone
// "Team Access" / "User Access" split tabs.
//
// In CI (Konflux), the SSO session is active so test fixtures are created via
// API. Locally without SSO, fixture creation fails gracefully and the tests
// fall back to finding any existing item on the list page (skipping if empty).
// ---------------------------------------------------------------------------
test.describe.serial('Hub Insights unified Access tab', () => {
  const testNamespace = `${E2E_PREFIX}ns_${Date.now()}`;
  const testRepo = `${E2E_PREFIX}repo_${Date.now()}`;
  const testRemote = `${E2E_PREFIX}remote_${Date.now()}`;
  let fixturesCreated = false;
  let repoHref: string | null = null;
  let remoteHref: string | null = null;
  let savedCookies: Awaited<ReturnType<import('@playwright/test').BrowserContext['cookies']>> = [];

  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToHub(page);
  });

  test('setup: create test fixtures (skips if no API auth)', async ({ page }) => {
    const nsOk = await createTestNamespace(page, testNamespace);
    if (!nsOk) {
      test.skip(true, 'Hub API not authenticated — skipping fixture creation (expected locally)');
      return;
    }

    repoHref = await createTestRepository(page, testRepo);
    remoteHref = await createTestRemote(page, testRemote);
    fixturesCreated = nsOk && !!repoHref && !!remoteHref;

    savedCookies = await page.context().cookies();
  });

  async function verifyUnifiedAccessTab(page: Page, detailRoute: string) {
    await navigateToHubRoute(page, detailRoute);
    await assertNoPageError(page);

    const accessTab = page.getByRole('tab', { name: /^Access$/i });
    await expect(accessTab).toBeVisible({ timeout: 15_000 });

    await expect(page.getByRole('tab', { name: /Team Access/i })).not.toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole('tab', { name: /User Access/i })).not.toBeVisible({
      timeout: 5_000,
    });

    await accessTab.click();
    await assertNoPageError(page);

    const usersHeading = page.getByRole('heading', { name: /^Users$/i });
    const groupsHeading = page.getByRole('heading', { name: /^Groups$/i });
    await expect(usersHeading).toBeVisible({ timeout: 15_000 });
    await expect(groupsHeading).toBeVisible({ timeout: 15_000 });
  }

  test('Namespace: should show unified Access tab', async ({ page }) => {
    test.skip(!fixturesCreated, 'No test fixtures — skipping');
    await verifyUnifiedAccessTab(page, `/partners/${testNamespace}`);
  });

  test('Repository: should show unified Access tab', async ({ page }) => {
    test.skip(!fixturesCreated, 'No test fixtures — skipping');
    await verifyUnifiedAccessTab(page, `/ansible/repositories/${testRepo}`);
  });

  test('Remote: should show unified Access tab', async ({ page }) => {
    test.skip(!fixturesCreated, 'No test fixtures — skipping');
    await verifyUnifiedAccessTab(page, `/ansible/remotes/${testRemote}`);
  });

  test.afterAll(async () => {
    if (!fixturesCreated) return;
    const ctx = await pwRequest.newContext({
      baseURL: `https://${APP_HOST}`,
      ignoreHTTPSErrors: true,
      storageState: { cookies: savedCookies, origins: [] },
    });
    const headers = { 'Content-Type': 'application/json' };
    await ctx
      .delete(`/api/automation-hub/_ui/v1/namespaces/${testNamespace}/`, { headers })
      .catch(() => {});
    if (repoHref) await ctx.delete(repoHref, { headers }).catch(() => {});
    if (remoteHref) await ctx.delete(remoteHref, { headers }).catch(() => {});
    await ctx.dispose();
  });
});

// ---------------------------------------------------------------------------
// Overview page
// ---------------------------------------------------------------------------
test.describe('Hub Insights overview page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigateToHub(page);
  });

  test('should load overview page without errors', async ({ page }) => {
    await test.step('Navigate to overview', async () => {
      await navigateToHubRoute(page, '/overview');
    });

    await test.step('Verify no error state', async () => {
      await assertNoPageError(page);
    });
  });
});
