import { expect, test } from '@playwright/test';
import { createE2EName } from '../commands/createE2EName';
import { setupAfter, setupBefore } from '../commands/setup';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test('create and delete an oauth application', async ({ page }) => {
  const applicationName = createE2EName('my-app');

  // Create OAuth application
  await page.getByRole('button', { name: 'Access Management' }).click();
  await page.getByRole('link', { name: 'OAuth Applications' }).click();
  await page.getByRole('link', { name: 'Create OAuth application' }).click();
  await page.getByPlaceholder('Enter OAuth application name').fill(applicationName);

  // Select organization
  await page.getByLabel('Organization *').click();
  await page.getByLabel('Search input').fill('Default');
  await page.getByRole('option', { name: 'Default' }).click();

  // Enter redirect URIs
  await page.getByPlaceholder('Enter redirect URIs').fill('http://example.com');

  // Click on Create button
  await page.getByRole('button', { name: 'Create OAuth application' }).click();

  // Verify OAuth application details in the modal
  await expect(page.getByLabel('Application').locator('#name')).toContainText(applicationName);
  await page.getByLabel('Close').click();

  // Verify OAuth application in the details page
  await expect(page.getByRole('heading')).toContainText(applicationName);
  await expect(page.locator('#name')).toContainText(applicationName);

  // Delete OAuth application
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Delete OAuth application' }).click();
  await page.getByText('Yes, I confirm').check();
  await page.getByRole('button', { name: 'Delete OAuth application' }).click();
  await page.getByRole('heading', { name: 'OAuth Applications', exact: true }).click();
  await page.getByLabel('Close').click();

  // Verify OAuth application is deleted - we should be back on the OAuth applications page
  await expect(page.locator('h1').first()).toContainText('OAuth Applications');
});
