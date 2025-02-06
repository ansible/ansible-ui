import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../commands/setup';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test('persona views', async ({ page }) => {
  // Administration View
  await expect(page.getByRole('button', { name: 'Administration View' })).toBeVisible();
  await expect(page.locator('#platform-overview')).toContainText('Overview');
  await expect(page.locator('#platform-awx')).toContainText('Automation Execution');
  await expect(page.locator('#platform-eda')).toContainText('Automation Decisions');
  await expect(page.locator('#platform-access')).toContainText('Access Management');
  await expect(page.locator('#platform-hub')).toContainText('Automation Content');
  await expect(page.locator('#awx-analytics')).toContainText('Automation Analytics');
  await expect(page.locator('#platform-lightspeed')).toContainText('Ansible Lightspeed');
  await expect(page.locator('#awx-settings')).toContainText('Settings');
  await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');
  await page.getByRole('button', { name: 'Administration View' }).click();

  // Developer View
  await page.getByRole('menuitem', { name: 'Developer View The developer' }).click();
  await expect(page.locator('#platform-overview')).toContainText('Overview');
  await expect(page.locator('#platform-awx')).toContainText('Automation Execution');
  await expect(page.locator('#platform-eda')).toContainText('Automation Decisions');
  await expect(page.locator('#platform-hub')).toContainText('Automation Content');
  await expect(page.locator('#platform-lightspeed')).toContainText('Ansible Lightspeed');
  await expect(page.locator('#awx-settings')).toContainText('Settings');
  await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');
  await page.getByRole('button', { name: 'Developer View' }).click();

  await expect(page.locator('#platform-access')).toBeHidden();
  await expect(page.locator('#awx-analytics')).toBeHidden();

  // Operator View
  await page.getByRole('menuitem', { name: 'Operator View The operator' }).click();
  await expect(page.locator('#awx-jobs')).toContainText('Jobs');
  await expect(page.locator('#awx-templates')).toContainText('Templates');
  await expect(page.locator('#awx-credentials')).toContainText('Credentials');
  await expect(page.locator('#awx-settings-preferences')).toContainText('User Preferences');
  await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');

  await expect(page.locator('#platform-awx')).toBeHidden();
  await expect(page.locator('#platform-eda')).toBeHidden();
  await expect(page.locator('#platform-access')).toBeHidden();
  await expect(page.locator('#platform-overview')).toBeHidden();
  await expect(page.locator('#platform-hub')).toBeHidden();
  await expect(page.locator('#awx-analytics')).toBeHidden();
  await expect(page.locator('#platform-lightspeed')).toBeHidden();
  await expect(page.locator('#awx-settings')).toBeHidden();
});
