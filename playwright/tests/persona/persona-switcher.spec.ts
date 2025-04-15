import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../commands/setup';
import { login, platformUI } from '../../commands/login';
import { createUser } from '../access-management/users/user-utils';
import { logout } from '../../commands/logout';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test('Persona views for System Administrator', async ({ page }) => {
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
  await page.locator('#platform-awx').click();
  await page.locator('#awx-administration').click();
  await expect(page.locator('#awx-management-jobs')).toContainText('Management Jobs');
  await page.locator('#awx-administration').click();
  await page.locator('#platform-awx').click();

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

test('Persona views for Normal User', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Administration View' })).toBeVisible();
  const username = await createUser({}, page);
  await page.locator('#platform-overview').click();

  // Logout as administrator
  await logout(page);

  // Login as normal user
  const platformUIWithoutSlash = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;
  await login(page, platformUIWithoutSlash + '/overview', {
    username,
    password: 'password',
  });

  // Administration View
  await expect(page.getByRole('button', { name: 'Administration View' })).toBeVisible();
  await expect(page.locator('#platform-overview')).toContainText('Overview');
  await expect(page.locator('#platform-awx')).toContainText('Automation Execution');
  await expect(page.locator('#platform-eda')).toContainText('Automation Decisions');
  await expect(page.locator('#platform-access')).toContainText('Access Management');
  await expect(page.locator('#platform-hub')).toContainText('Automation Content');
  await expect(page.locator('#platform-lightspeed')).toContainText('Ansible Lightspeed');
  await expect(page.locator('#awx-settings')).toContainText('Settings');
  await expect(page.locator('#platform-quickstarts')).toContainText('QuickStarts');
  await expect(page.locator('#awx-analytics')).toBeHidden();
  // Management jobs not shown for a normal user
  await page.locator('#platform-awx').click();
  await page.locator('#awx-administration').click();
  await expect(page.locator('#awx-management-jobs')).toBeHidden();
  await page.locator('#awx-administration').click();
  await page.locator('#platform-awx').click();

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
  await logout(page, { username });
});
