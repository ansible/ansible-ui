import { Page, expect } from '@playwright/test';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { clickPageAction } from '../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../commands/clickTableRow';

export async function createAwxCredential(
  options: { credentialName?: string; credentialType?: string },
  page: Page
) {
  const testToken = createE2EName('test-token');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
  await page.getByText('Create credential', { exact: true }).click();
  const credentialName = options.credentialName ?? createE2EName('credential');
  await page.getByPlaceholder('Enter credential name').fill(credentialName);
  await page.getByLabel('Credential type *').click();
  if (options?.credentialType && options.credentialType === 'Vault') {
    await page.getByRole('textbox', { name: 'Search input' }).fill('Vault');
    await page.getByRole('option', { name: 'Vault', exact: true }).click();
    await page.getByRole('textbox', { name: 'Vault Password' }).click();
    await page.getByRole('textbox', { name: 'Vault Password' }).fill('pwd');
    await page.getByRole('textbox', { name: 'Vault Identifier' }).click();
    await page.getByRole('textbox', { name: 'Vault Identifier' }).fill('id');
  } else if (options?.credentialType && options.credentialType === 'Machine') {
    await page.getByRole('textbox', { name: 'Search input' }).fill('Machine');
    await page.getByRole('option', { name: 'Machine', exact: true }).click();
    await page.getByRole('textbox', { name: 'Username', exact: true }).click();
    await page.getByRole('textbox', { name: 'Username', exact: true }).fill('username');
    await page.getByRole('textbox', { name: 'Password', exact: true }).click();
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('pwd');
  } else {
    await page.getByLabel('Search input').fill('Github Personal Access Token');
    await page.getByRole('option', { name: 'GitHub Personal Access Token' }).click();
    await page.getByPlaceholder('Enter value').fill(testToken);
  }
  await page.getByRole('button', { name: 'Create credential' }).click();
  await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
  return credentialName;
}

export async function deleteAwxCredential(credentialName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
  await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
  await clickPageAction('Delete credential', page);
  await confirmAndAssertDeletion(page);
}
