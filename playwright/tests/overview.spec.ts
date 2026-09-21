import { expect, test, type Page } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

// Requires controller list filters last_job_host_summary__failed on the E2E backend (2.7 today).
async function expectHostsPageWithStatusFilter(page: Page, status: 'ready' | 'failed') {
  await expect(page.getByTestId('page-title')).toContainText('Hosts');
  await expect(page.getByRole('heading', { name: 'Error loading hosts' })).not.toBeVisible();
  await expect(
    page.getByTestId('page-toolbar').or(page.locator('#awx-hosts-table'))
  ).toBeVisible({ timeout: 15_000 });

  if (status === 'ready') {
    await expect(page).toHaveURL(/ready_status=True/);
    await expect(page.getByRole('list', { name: 'Ready Status' })).toContainText(
      'Show only ready hosts'
    );
  } else {
    await expect(page).toHaveURL(/failed_status=True/);
    await expect(page.getByRole('list', { name: 'Failed Status' })).toContainText(
      'Show only failed hosts'
    );
  }
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
      await expectHostsPageWithStatusFilter(page, 'ready');
    }
    await page.getByRole('link', { name: 'Overview' }).click();
    if (await page.locator('#hosts').getByRole('link', { name: 'Failed' }).isVisible()) {
      await page.locator('#hosts').getByRole('link', { name: 'Failed' }).click();
      await expectHostsPageWithStatusFilter(page, 'failed');
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
