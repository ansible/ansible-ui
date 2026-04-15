import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test('overview - dashboard cards', async ({ page }) => {
  await expect(page.locator('h1').first()).toContainText('Welcome to Ansible');

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
  await expect(page.locator('h1').first()).toContainText('Welcome to Ansible');

  if (await page.locator('#platform-awx').isVisible()) {
    await expect(page.locator('#resource-counts')).toContainText('Resource Counts');
    if (await page.locator('#hosts').getByRole('link', { name: 'Ready' }).isVisible()) {
      await page.locator('#hosts').getByRole('link', { name: 'Ready' }).click();
      await expect(page.getByTestId('page-title')).toContainText('Hosts');
      await expect(page.getByText('Ready Status')).toBeVisible();
      await expect(page.getByText('Show only ready hosts')).toBeVisible();
    }
    await page.getByRole('link', { name: 'Overview' }).click();
    if (await page.locator('#hosts').getByRole('link', { name: 'Failed' }).isVisible()) {
      await page.locator('#hosts').getByRole('link', { name: 'Failed' }).click();
      await expect(page.getByRole('heading')).toContainText('Hosts');
      await expect(page.getByText('Failed Status')).toBeVisible();
      await expect(page.getByText('Show only failed hosts')).toBeVisible();
    }
  }
});
