import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test('overview - dashboard cards', async ({ page }) => {
  await expect(page.locator('h1').first()).toContainText('Welcome to Ansible');

  if (await page.getByTestId('platform-awx').isVisible()) {
    await expect(page.getByTestId('resource-counts')).toContainText('Resource Counts');
    await expect(page.getByTestId('job-activity')).toContainText('Job Activity');
    await expect(page.getByTestId('jobs-card')).toContainText('Jobs');
    await expect(page.getByTestId('projects-card')).toContainText('Projects');
    await expect(page.getByTestId('inventories-card')).toContainText('Inventories');
  } else {
    await expect(page.getByTestId('resource-counts')).not.toBeVisible();
    await expect(page.getByTestId('job-activity')).not.toBeVisible();
    await expect(page.getByTestId('jobs-card')).not.toBeVisible();
    await expect(page.getByTestId('projects-card')).not.toBeVisible();
    await expect(page.getByTestId('inventories-card')).not.toBeVisible();
  }

  if (await page.getByTestId('platform-eda').isVisible()) {
    await expect(page.getByTestId('rulebook-activations')).toContainText('Rulebook Activations');
    await expect(page.getByTestId('recent-rule-audits')).toContainText('Rule Audit');
    await expect(page.getByTestId('decision-environments')).toContainText('Decision Environments');
  } else {
    await expect(page.getByTestId('rulebook-activations')).not.toBeVisible();
    await expect(page.getByTestId('recent-rule-audits')).not.toBeVisible();
    await expect(page.getByTestId('decision-environments')).not.toBeVisible();
  }
});

test('hosts resource counts should redirect correctly', async ({ page }) => {
  await expect(page.locator('h1').first()).toContainText('Welcome to Ansible');

  if (await page.getByTestId('platform-awx').isVisible()) {
    await expect(page.getByTestId('resource-counts')).toContainText('Resource Counts');
    if (await page.getByTestId('hosts').getByRole('link', { name: 'Ready' }).isVisible()) {
      await page.getByTestId('hosts').getByRole('link', { name: 'Ready' }).click();
      await expect(page.getByTestId('page-title')).toContainText('Hosts');
      await expect(page.getByText('Ready Status')).toBeVisible();
      await expect(page.getByText('Show only ready hosts')).toBeVisible();
    }
    await page.getByRole('link', { name: 'Overview' }).click();
    if (await page.getByTestId('hosts').getByRole('link', { name: 'Failed' }).isVisible()) {
      await page.getByTestId('hosts').getByRole('link', { name: 'Failed' }).click();
      await expect(page.getByRole('heading')).toContainText('Hosts');
      await expect(page.getByText('Failed Status')).toBeVisible();
      await expect(page.getByText('Show only failed hosts')).toBeVisible();
    }
  }
});
