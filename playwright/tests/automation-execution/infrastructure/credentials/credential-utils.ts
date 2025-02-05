import { Page, expect } from '@playwright/test';
import { clearTableFilters } from '../../../../commands/clearTableFilters';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { selectTableFilter } from '../../../../commands/selectTableFilter';

export async function createAwxCredential(options: { credentialName?: string }, page: Page) {
  const testToken = createE2EName('test-token');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
  await page.getByRole('button', { name: 'Create credential' }).click();
  const credentialName = options.credentialName ?? createE2EName('credential');
  await page.getByPlaceholder('Enter credential name').fill(credentialName);
  await page.getByLabel('Credential type *').click();
  await page.getByLabel('Search input').fill('Github Personal Access Token');
  await page.getByRole('option', { name: 'GitHub Personal Access Token' }).click();
  await page.getByPlaceholder('Enter value').fill(testToken);
  await page.getByRole('button', { name: 'Create credential' }).click();
  await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
  return credentialName;
}
export async function deleteAwxCredential(credentialName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
  await clearTableFilters(page);
  await selectTableFilter('Name', page);
  await page.getByRole('button', { name: 'Select name' }).click();
  await page.getByLabel('Search input').click();
  await page.getByLabel('Search input').fill(credentialName);
  await page.getByLabel('Search input').press('Enter');
  await page.locator('#filter-input-select').getByText(credentialName).click();
  await page.getByRole('row', { name: credentialName }).getByLabel('Select row').click();
  await page.getByLabel('toolbar actions').click();
  await page.getByRole('menuitem', { name: 'Delete credential' }).click();
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete credential' }).click();
  await expect(page.locator('[data-ouia-component-type="PF5/ModalContent"]')).toContainText(
    'Success'
  );
}
