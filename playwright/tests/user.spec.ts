import { expect, test } from '@playwright/test';
import { createE2EUsername } from '../commands/createE2EName';
import { setupAfter, setupBefore } from '../commands/setup';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test('user - create and delete', async ({ page }) => {
  const username = createE2EUsername();
  await page.getByRole('button', { name: 'Access Management' }).click();
  await page.getByRole('link', { name: 'Users' }).click();
  await page.getByRole('link', { name: 'Create user' }).click();
  await page.getByPlaceholder('Enter username').fill(username);
  await page.getByLabel('Password *', { exact: true }).fill('test');
  await page.getByLabel('Confirm password *').fill('test');
  await page.getByRole('button', { name: 'Create user' }).click();
  await expect(page.locator('#username')).toContainText(username);
  await expect(page.locator('#user-type')).toContainText('Normal user');
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Delete user' }).click();
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete user' }).click();
});
