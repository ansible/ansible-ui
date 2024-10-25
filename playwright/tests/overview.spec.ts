import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';

test.beforeEach(setupBefore);
test.afterEach(setupAfter);

test('overview shows the right dashboard cards', async ({ page }) => {
  await expect(page.locator('h1').first()).toContainText(
    'Welcome to the Ansible Automation Platform'
  );

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
