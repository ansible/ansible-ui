import { expect, Page, Request, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

const COLLECTION_STATUS_ROUTE = '**/api/metrics/v1/dashboard_reports/collection_status/';
const LEADERBOARD_DETAIL_TEST_ID = 'enable-automation-leaderboard';
const LEADERBOARD_SELECT_TEST_ID = 'show-leaderboard-form-group';

interface CollectionStatus {
  enabled: boolean;
  last_sync: string;
  show_dashboard: boolean;
  show_leaderboard: boolean;
}

/**
 * Serves collection_status from in-memory state: GET returns the current state and POST merges
 * the request body into it, so the details page shows what the edit form saved.
 */
async function mockCollectionStatus(page: Page, initial: Partial<CollectionStatus> = {}) {
  let status: CollectionStatus = {
    enabled: true,
    last_sync: '2026-09-01T14:00:00.000Z',
    show_dashboard: true,
    show_leaderboard: true,
    ...initial,
  };
  await page.route(COLLECTION_STATUS_ROUTE, async (route) => {
    if (route.request().method() === 'POST') {
      status = { ...status, ...(route.request().postDataJSON() as Partial<CollectionStatus>) };
    }
    await route.fulfill({ status: 200, contentType: 'application/json', json: status });
  });
}

function isCollectionStatusPost(request: Request) {
  return (
    request.url().includes('/dashboard_reports/collection_status/') && request.method() === 'POST'
  );
}

async function openAutomationAnalyticsSettings(page: Page) {
  await navigateTo(page, 'Settings', 'Automation Analytics');
  await expect(page.getByRole('heading', { name: 'Automation Analytics Settings' })).toBeVisible();
}

async function selectLeaderboardOption(page: Page, option: 'Enabled' | 'Disabled') {
  // The form group wrapper and the select toggle share this test id; the toggle is the button
  await page.getByTestId(LEADERBOARD_SELECT_TEST_ID).and(page.getByRole('button')).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test.afterEach(setupAfter);

test.describe('Automation Analytics Settings', () => {
  test('should show the leaderboard as enabled on the details page', async ({ page }) => {
    await mockCollectionStatus(page);
    await setupBefore()({ page });

    await openAutomationAnalyticsSettings(page);

    await expect(page.getByTestId(LEADERBOARD_DETAIL_TEST_ID)).toHaveText('Enabled');
  });

  test('should disable the leaderboard from the edit page', async ({ page }) => {
    await mockCollectionStatus(page);
    await setupBefore()({ page });
    await openAutomationAnalyticsSettings(page);

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await selectLeaderboardOption(page, 'Disabled');

    const postRequest = page.waitForRequest(isCollectionStatusPost);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    expect((await postRequest).postDataJSON()).toEqual({ show_leaderboard: false });
    await expect(page.getByTestId(LEADERBOARD_DETAIL_TEST_ID)).toHaveText('Disabled');
  });

  test('should enable the leaderboard from the edit page', async ({ page }) => {
    await mockCollectionStatus(page, { show_leaderboard: false });
    await setupBefore()({ page });
    await openAutomationAnalyticsSettings(page);
    await expect(page.getByTestId(LEADERBOARD_DETAIL_TEST_ID)).toHaveText('Disabled');

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await selectLeaderboardOption(page, 'Enabled');

    const postRequest = page.waitForRequest(isCollectionStatusPost);
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    expect((await postRequest).postDataJSON()).toEqual({ show_leaderboard: true });
    await expect(page.getByTestId(LEADERBOARD_DETAIL_TEST_ID)).toHaveText('Enabled');
  });

  test('should return to the details page without saving on cancel', async ({ page }) => {
    const postedRequests: Request[] = [];
    page.on('request', (request) => {
      if (isCollectionStatusPost(request)) postedRequests.push(request);
    });
    await mockCollectionStatus(page);
    await setupBefore()({ page });
    await openAutomationAnalyticsSettings(page);

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await selectLeaderboardOption(page, 'Disabled');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect(page.getByTestId(LEADERBOARD_DETAIL_TEST_ID)).toHaveText('Enabled');
    expect(postedRequests).toHaveLength(0);
  });
});
