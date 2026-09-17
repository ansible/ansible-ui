import { expect, test, type Page } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

// Ready/Failed counts must not send last_job_host_summary list filters:
// 2.7 OPTIONS advertises the dead FK (stale/400); devel OPTIONS is
// filterable:false and the same query 400s. Wait for the real toolbar
// (not the OPTIONS loading table) on either backend.
async function expectHostsListLoadedWithoutStatusFilter(page: Page) {
  await expect(page.getByTestId('page-title')).toContainText('Hosts');
  await expect(page.getByTestId('page-toolbar')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Error loading hosts' })).not.toBeVisible();
  await expect(page).not.toHaveURL(/ready_status|failed_status|last_job_host_summary/);
}

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test('overview - dashboard cards', async ({ page }) => {
  await expect(page.locator('h1').first()).toContainText(/Welcome to (?:the )?Ansible/);

  if (await page.locator('#platform-awx').isVisible()) {
    await expect(page.locator('#resource-counts')).toContainText('Resource Counts');
    await expect(page.locator('#job-activity')).toContainText('Job Activity');
    await expect(page.locator('#jobs-card')).toContainText('Jobs');
    await expect(page.locator('#projects-card')).toContainText('Projects');
    await expect(page.locator('#inventories-card')).toContainText('Inventories');
  } else {
    await expect(page.locator('#resource-counts')).not.toBeVisible();
    await expect(page.locator('#job-activity')).not.toBeVisible();
    await expect(page.locator('#jobs-card')).not.toBeVisible();
    await expect(page.locator('#projects-card')).not.toBeVisible();
    await expect(page.locator('#inventories-card')).not.toBeVisible();
  }

  if (await page.locator('#platform-eda').isVisible()) {
    await expect(page.locator('#rulebook-activations')).toContainText('Rulebook Activations');
    await expect(page.locator('#recent-rule-audits')).toContainText('Rule Audit');
    await expect(page.locator('#decision-environments')).toContainText('Decision Environments');
  } else {
    await expect(page.locator('#rulebook-activations')).not.toBeVisible();
    await expect(page.locator('#recent-rule-audits')).not.toBeVisible();
    await expect(page.locator('#decision-environments')).not.toBeVisible();
  }
});

test('hosts resource counts should redirect correctly', async ({ page }) => {
  await expect(page.locator('h1').first()).toContainText(/Welcome to (?:the )?Ansible/);

  if (await page.locator('#platform-awx').isVisible()) {
    await expect(page.locator('#resource-counts')).toContainText('Resource Counts');
    if (await page.locator('#hosts').getByRole('link', { name: 'Ready' }).isVisible()) {
      await page.locator('#hosts').getByRole('link', { name: 'Ready' }).click();
      await expectHostsListLoadedWithoutStatusFilter(page);
    }
    await page.getByRole('link', { name: 'Overview' }).click();
    if (await page.locator('#hosts').getByRole('link', { name: 'Failed' }).isVisible()) {
      await page.locator('#hosts').getByRole('link', { name: 'Failed' }).click();
      await expectHostsListLoadedWithoutStatusFilter(page);
    }
  }
});

test('notifications drawer can be opened and closed', async ({ page }) => {
  await expect(page.locator('h1').first()).toContainText(/Welcome to (?:the )?Ansible/);

  const notificationsButton = page.getByTestId('notification-badge');
  if (await notificationsButton.isVisible()) {
    await notificationsButton.click();
    await expect(page.locator('.pf-v6-c-notification-drawer')).toBeVisible();

    const closeButton = page.locator('.pf-v6-c-notification-drawer').getByRole('button', {
      name: /close/i,
    });
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(page.locator('.pf-v6-c-notification-drawer')).not.toBeVisible();
    }
  }
});
