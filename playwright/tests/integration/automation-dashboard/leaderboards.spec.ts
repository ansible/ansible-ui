import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

/**
 * Smoke tests for the Automation Dashboard → Leaderboards view.
 *
 * Both backend responses the view depends on are served from recorded fixtures in
 * `leaderboard_fixtures/` (see its README), so the assertions below can name concrete values
 * instead of whatever the instance happens to have synced. One user is enough for a smoke test;
 * `alice` is the fixture that exercises every region with data — a #1 ranked organization, an
 * active streak on both strips, a top-10 placing in one activity level but not the others, and
 * both earned and locked achievements.
 */
const FIXTURE_USER = 'alice';

/**
 * `admin` is the only recorded fixture with `show_dashboard: true`, so it is the only one that
 * renders the Dashboard/Leaderboards tabs. Used solely to cover reaching the view through the tab.
 */
const TABBED_FIXTURE_USER = 'admin';

const FIXTURE_DIR = path.join(import.meta.dirname, 'leaderboard_fixtures');

/**
 * `alice__collection_status.json` has `show_dashboard: false` with `show_leaderboard: true`, so
 * the page renders the leaderboards as a single view with no tabs (see
 * AutomationDashboardMainPage). Under that flag combination the `/leaderboards` child route does
 * not exist and deep-linking to it renders "Page not found", so navigate to the parent path.
 */
const DASHBOARD_PATH = '/analytics/automation-dashboard';

function fixture(user: string, report: 'leaderboard' | 'collection_status'): string {
  return readFileSync(path.join(FIXTURE_DIR, `${user}__${report}.json`), 'utf8');
}

async function mockLeaderboardFixtures(page: Page, user: string): Promise<void> {
  await page.route(`**/api/metrics/v1/dashboard_reports/collection_status/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: fixture(user, 'collection_status'),
    });
  });
  await page.route(`**/api/metrics/v1/dashboard_reports/leaderboard/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: fixture(user, 'leaderboard'),
    });
  });
}

/**
 * Records uncaught exceptions raised by the page. Returned by reference so an `afterEach` can
 * fail any test whose render threw, which is the broadest "nothing is broken" check available
 * without asserting on individual elements.
 */
function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/**
 * Scopes to one "At a glance" KPI tile. Those three tiles render through `PageDashboardCard`
 * without an `id`, so their `data-testid` is a generated React id (`:r3q:`) that is not stable
 * across renders. `.page-dashboard-card` is the class `PageDashboardCard` sets on itself, which
 * makes it a stable handle; the other leaderboard cards are addressed by their own test id.
 */
function kpiTile(page: Page, title: string): Locator {
  return page.locator('.page-dashboard-card').filter({ hasText: title });
}

/** One selectable activity-level tile ("Volume", "Breadth", "Consistency"). */
function activityLevelTile(card: Locator, name: string): Locator {
  return card.getByRole('button', { name: new RegExp(`^${name}`) });
}

test.describe('Automation Dashboard - Leaderboards', () => {
  let pageErrors: string[];

  test.beforeEach(async ({ page }, testInfo) => {
    pageErrors = collectPageErrors(page);
    // Routes must be registered before login so they also intercept the requests the page fires
    // during its initial render.
    await mockLeaderboardFixtures(page, FIXTURE_USER);
    await setupBefore({ path: DASHBOARD_PATH })({ page }, testInfo);
    // The report has rendered once the first section is on screen; every test asserts past this.
    await expect(page.getByTestId('at-a-glance-card-title')).toBeVisible();
  });

  test.afterEach(setupAfter);

  test.afterEach(() => {
    expect(pageErrors, 'the page raised uncaught errors while rendering').toStrictEqual([]);
  });

  test('should render every leaderboard section as a single untabbed view', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'At a glance' })).toBeVisible();
    await expect(page.getByTestId('automation-streak')).toBeVisible();
    await expect(page.getByTestId('activity-levels')).toBeVisible();
    await expect(page.getByTestId('highlights-leaderboard-card')).toBeVisible();
    await expect(page.getByTestId('milestone-badges-card')).toBeVisible();

    // show_dashboard is false for this fixture, so the Dashboard/Leaderboards tabs are not rendered.
    await expect(page.getByRole('tab')).toHaveCount(0);
  });

  test('should render the report without falling back to an error or empty state', async ({
    page,
  }) => {
    // Every state AutomationLeaderboards can render instead of the report. Asserting their
    // absence catches a section that silently degraded rather than failing a value assertion.
    await expect(page.getByText('Unable to load leaderboards')).toHaveCount(0);
    await expect(page.getByText('Unable to load sync status')).toHaveCount(0);
    await expect(page.getByText('Unable to load dashboard data')).toHaveCount(0);
    await expect(page.getByText('No leaderboard data yet')).toHaveCount(0);
    await expect(page.getByText("Couldn't load the latest leaderboard data.")).toHaveCount(0);
    await expect(
      page.getByText('You do not have permission to view the Automation Dashboard or Leaderboards.')
    ).toHaveCount(0);
  });

  test('should show the reporting window and the last sync timestamp', async ({ page }) => {
    await expect(
      page.getByText('Data shown below is based on the last 30 days of activity.')
    ).toBeVisible();
    // The timestamp is rendered in the browser's locale, so assert its shape rather than a date.
    await expect(page.getByText(/^Updated: .+ UTC$/)).toBeVisible();
  });

  test('should show the At a glance metrics from the synced report', async ({ page }) => {
    // `toHaveText` compares the element's whole text, so these fail on any other value. Searching
    // the tile for the expected text instead would also match a longer number containing it —
    // `getByText('444')` matches a tile rendering "1,444".
    await expect(kpiTile(page, 'Jobs run').getByTestId('metric-value')).toHaveText('444');
    await expect(kpiTile(page, 'Active organizations').getByTestId('metric-value')).toHaveText(
      '11'
    );

    const featuredTemplate = kpiTile(page, 'Featured template');
    await expect(featuredTemplate.getByTestId('metric-value')).toHaveText('142 runs');
    await expect(featuredTemplate.getByText('template-org-a', { exact: true })).toBeVisible();
  });

  test('should show an enterprise and an organization streak with a cell per day', async ({
    page,
  }) => {
    const streak = page.getByTestId('automation-streak');

    await expect(streak.getByRole('heading', { name: 'Enterprise' })).toBeVisible();
    await expect(streak.getByRole('heading', { name: 'Your organization' })).toBeVisible();
    await expect(streak.getByText('30-day streak', { exact: true })).toBeVisible();
    await expect(streak.getByText('14-day streak', { exact: true })).toBeVisible();

    // 30 days on each of the two strips, each day a button labelled with its run count.
    await expect(streak.getByRole('button', { name: /job run/ })).toHaveCount(60);
    // The most recent enterprise day in the fixture; no other day on either strip has 21 runs.
    await expect(streak.getByRole('button', { name: /: 21 successful job runs$/ })).toHaveCount(1);
    await expect(
      streak.getByRole('button', { name: /: No successful job runs$/ }).first()
    ).toBeVisible();
  });

  test('should show the user score and rank in each activity level', async ({ page }) => {
    const card = page.getByTestId('activity-levels');

    await expect(card.getByRole('heading', { name: 'Volume', exact: true })).toBeVisible();
    await expect(card.getByRole('heading', { name: 'Breadth', exact: true })).toBeVisible();
    await expect(card.getByRole('heading', { name: 'Consistency', exact: true })).toBeVisible();

    const volume = activityLevelTile(card, 'Volume');
    await expect(volume.getByTestId('metric-value')).toHaveText('13');
    await expect(volume).toContainText('Rank 12 of 19');

    const breadth = activityLevelTile(card, 'Breadth');
    await expect(breadth.getByTestId('metric-value')).toHaveText('1');
    await expect(breadth).toContainText('Rank 5 of 19');

    const consistency = activityLevelTile(card, 'Consistency');
    await expect(consistency.getByTestId('metric-value')).toHaveText('13');
    await expect(consistency).toContainText('Rank 8 of 19');
  });

  test('should switch the ranked list when another activity level is selected', async ({
    page,
  }) => {
    const card = page.getByTestId('activity-levels');
    // Every row of the ranked list is numbered "#1".."#10"; nothing else in the card is.
    const rankedRows = card.getByText(/^#\d+$/);

    // Volume is selected on load. This user ranks 12th there, outside the top 10, so no row is
    // tagged as theirs.
    await expect(card.getByRole('heading', { name: 'Top 10 — Volume' })).toBeVisible();
    await expect(rankedRows).toHaveCount(10);
    await expect(card.getByText('You', { exact: true })).toHaveCount(0);

    await activityLevelTile(card, 'Breadth').click();

    // They rank 5th in Breadth, so their own row appears in the list and is tagged.
    await expect(card.getByRole('heading', { name: 'Top 10 — Breadth' })).toBeVisible();
    await expect(rankedRows).toHaveCount(10);
    await expect(card.getByText(FIXTURE_USER, { exact: true })).toBeVisible();
    await expect(card.getByText('You', { exact: true })).toHaveCount(1);
  });

  test('should rank the top 10 organizations and tag only the user organization', async ({
    page,
  }) => {
    const card = page.getByTestId('highlights-leaderboard-card');

    // A header row plus the ten ranked organizations.
    await expect(card.getByRole('row')).toHaveCount(11);

    const userOrgRow = card.getByRole('row').filter({ hasText: 'org-a' });
    await expect(userOrgRow.getByText('Your organization', { exact: true })).toBeVisible();
    await expect(card.getByText('Your organization', { exact: true })).toHaveCount(1);
    await expect(userOrgRow).toContainText('#1');
    await expect(userOrgRow).toContainText('156');

    // The card header repeats the user organization's standing.
    await expect(card.getByText("Your organization's rank: #1", { exact: true })).toBeVisible();
    await expect(card.getByText('156 job runs', { exact: true })).toBeVisible();
  });

  test('should mark each achievement as earned or locked', async ({ page }) => {
    const card = page.getByTestId('milestone-badges-card');

    await expect(card.getByRole('heading', { name: 'Your achievements' })).toBeVisible();
    await expect(
      card.getByRole('heading', { name: "Your organization's achievements" })
    ).toBeVisible();

    // Three of the seven user achievements and all three organization achievements are earned.
    await expect(card.getByRole('button', { name: /, earned\./ })).toHaveCount(6);
    await expect(card.getByRole('button', { name: /, locked\./ })).toHaveCount(4);

    // The accessible name carries the state and the rule, which is the only text a locked badge
    // exposes beyond its label.
    await expect(
      card.getByRole('button', {
        name: 'Ignition, earned. Ran your first successful job in the current 30-day window.',
      })
    ).toBeVisible();
    await expect(
      card.getByRole('button', {
        name: 'Centurion, locked. Ran 100 or more successful jobs in the window.',
      })
    ).toBeVisible();
  });

  // Earned-before-locked ordering is deliberately not asserted here: MilestoneBadgesCard.test.tsx
  // already covers it, and does so more precisely by asserting the badge labels in order rather
  // than only their earned/locked states.

  test('should render earned badges filled and locked badges dimmed', async ({ page }) => {
    const card = page.getByTestId('milestone-badges-card');

    // Filled vs dimmed is purely a styling difference driven by these two classes, with no
    // user-facing attribute to assert instead; the accessible name (covered above) is what
    // conveys the state non-visually.
    await expect(card.locator('.achievement-badge--earned')).toHaveCount(6);
    await expect(card.locator('.achievement-badge--locked')).toHaveCount(4);

    // A badge's rule is not visible text — it is revealed on hover.
    await card.getByRole('button', { name: /^Centurion, locked\./ }).hover();
    await expect(page.getByRole('tooltip')).toContainText(
      'Ran 100 or more successful jobs in the window.'
    );
  });

  test('should announce new achievements in a dismissible alert', async ({ page }) => {
    const alert = page.getByText(
      'Congratulations! You or your organization earned new achievements.'
    );
    await expect(alert).toBeVisible();

    await page.getByRole('button', { name: /^Close Success alert/ }).click();

    await expect(alert).toBeHidden();
  });
});

test.describe('Automation Dashboard - Leaderboards tab', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await mockLeaderboardFixtures(page, TABBED_FIXTURE_USER);
    await setupBefore({ path: DASHBOARD_PATH })({ page }, testInfo);
  });

  test.afterEach(setupAfter);

  test('should open the leaderboards from the Leaderboards tab', async ({ page }) => {
    // This fixture grants both views, so the page renders them as tabs.
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await page.getByRole('tab', { name: 'Leaderboards' }).click();

    await expect(page).toHaveURL(/\/analytics\/automation-dashboard\/leaderboards$/);
    await expect(page.getByTestId('at-a-glance-card-title')).toBeVisible();
    await expect(page.getByTestId('automation-streak')).toBeVisible();
    await expect(page.getByTestId('activity-levels')).toBeVisible();
    await expect(page.getByTestId('highlights-leaderboard-card')).toBeVisible();
    await expect(page.getByTestId('milestone-badges-card')).toBeVisible();
  });
});
