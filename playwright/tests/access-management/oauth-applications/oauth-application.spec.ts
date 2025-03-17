import { expect, test } from '@playwright/test';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { setupAfter, setupBefore } from '../../../commands/setup';

test.beforeEach(setupBefore({ path: '/access/applications' }));
test.afterEach(setupAfter);

test('application - create and delete', { tag: ['@not_mock'] }, async ({ page }) => {
  const applicationName = createE2EName('my-app');

  // Create OAuth application
  await page.getByRole('button', { name: 'Access Management' }).click();
  await page.getByRole('link', { name: 'OAuth Applications' }).click();
  await page.getByText('Create OAuth application', { exact: true }).click();
  // Enter Name
  await page.getByPlaceholder('Enter OAuth application name').fill(applicationName);
  // Enter Description
  await page.getByPlaceholder('Enter description').fill('My first OAuth application');
  // Enter URL
  await page.getByPlaceholder('Enter OAuth application URL').fill('http://example.com');
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

  await expect(page.locator('#application-links')).toBeVisible();
  await page.locator('#application-links').click();
  await expect(
    page.getByRole('navigation').getByRole('link', { name: applicationName, exact: true })
  ).toBeVisible();

  // Verify OAuth application in the details page
  await expect(page.getByRole('heading', { name: applicationName, exact: true })).toBeVisible();
  await expect(page.locator('#name')).toContainText(applicationName);
  if (page.mock.enabled) {
    await expect(page.locator('#url')).toContainText('http://example.com');
  }
  await expect(page.locator('#description')).toContainText('My first OAuth application');
  await expect(page.locator('#organization')).toContainText('Default');
  await expect(page.locator('#redirect-uris')).toContainText('http://example.com');
  // Delete OAuth application
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Delete OAuth application' }).click();
  await confirmAndAssertDeletion(page);
});
