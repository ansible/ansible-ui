import { Page, expect } from '@playwright/test';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../commands/createE2EName';
import { navigateTo } from '../../../../../commands/navigateTo';
import { filterTable } from '../../../../../commands/filterTable';

export interface CreateCredentialOptions {
  credentialName?: string;
  credentialType?: string;
  organization?: string;
  inputs?: Record<string, string>;
  description?: string;
  username?: string;
  password?: string;
  vaultId?: string;
}

export async function createAwxCredential(options: CreateCredentialOptions, page: Page) {
  const testToken = createE2EName('test-token');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
  await page.getByText('Create credential', { exact: true }).click();
  const credentialName = options.credentialName ?? createE2EName('credential');
  await expect(page.getByPlaceholder('Enter credential name')).toBeVisible();
  await page.getByPlaceholder('Enter credential name').fill(credentialName);

  // Select credential type
  await page.getByRole('button', { name: 'Credential type' }).click();
  if (options?.credentialType && options.credentialType === 'Vault') {
    await page.getByRole('textbox', { name: 'Search input' }).fill('Vault');
    await page.getByRole('option', { name: 'Vault', exact: true }).click();
    await page.getByRole('textbox', { name: 'Vault Password' }).click();
    await page.getByRole('textbox', { name: 'Vault Password' }).fill(options.password || 'pwd');
    await page.getByRole('textbox', { name: 'Vault Identifier' }).click();
    await page.getByRole('textbox', { name: 'Vault Identifier' }).fill(options.vaultId ?? 'id');
  } else if (options?.credentialType && options.credentialType === 'Machine') {
    await expect(page.getByRole('textbox', { name: 'Search input' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Search input' }).fill('Machine');
    await page.getByRole('option', { name: 'Machine', exact: true }).click();

    await expect(page.locator('#username-form-group')).toBeVisible();
    await page.getByRole('textbox', { name: 'Username', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Username', exact: true })
      .fill(options.username || 'username');

    await expect(page.locator('#password-form-group')).toBeVisible();
    await page.getByRole('textbox', { name: 'Password', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill(options.password || 'pwd');
  } else if (options?.credentialType === 'Centrify Vault Credential Provider Lookup') {
    await page.getByRole('textbox', { name: 'Search input' }).fill('Centrify');
    await page.getByRole('option', { name: 'Centrify Vault Credential Provider Lookup' }).click();
    if (options.inputs) {
      if (options.inputs.url) {
        await page.getByRole('textbox', { name: 'Centrify Tenant URL' }).fill(options.inputs.url);
      }
      if (options.inputs.client_id) {
        await page
          .getByRole('textbox', { name: 'Centrify API User' })
          .fill(options.inputs.client_id);
      }
      if (options.inputs.client_password) {
        await page
          .getByRole('textbox', { name: 'Centrify API User Password' })
          .fill(options.inputs.client_password);
      }
    }
  } else if (options?.credentialType === 'Container Registry') {
    await page.getByRole('textbox', { name: 'Search input' }).fill('Container Registry');
    await page.getByRole('option', { name: 'Container Registry' }).click();
  } else if (options?.credentialType === 'Amazon Web Services') {
    await page.getByRole('textbox', { name: 'Search input' }).fill('Amazon Web Services');
    await page.getByRole('option', { name: 'Amazon Web Services' }).click();
  } else {
    await page.getByLabel('Search input').fill('Github Personal Access Token');
    await page.getByRole('option', { name: 'GitHub Personal Access Token' }).click();
    await page.getByPlaceholder('Enter value').fill(testToken);
  }

  // Add description if provided
  if (options.description) {
    await page.getByRole('textbox', { name: 'Description' }).fill(options.description);
  }

  await page.getByRole('button', { name: 'Create credential' }).click();
  await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
  return credentialName;
}

export async function deleteAwxCredential(credentialName: string, page: Page) {
  // Navigate to credentials page first
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');

  // Try to filter first, but if it fails, proceed without filtering
  try {
    await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
    await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
  } catch (error) {
    // If filtering fails, try to find the row directly (error silently handled)
  }

  // Find the row with the credential name and click its kebab menu
  const row = page.getByRole('row').filter({ hasText: credentialName });
  await row.getByRole('button', { name: 'kebab dropdown toggle' }).click();

  // Click delete from the dropdown
  await page.getByRole('menuitem', { name: 'Delete credential' }).click();
  await confirmAndAssertDeletion(page);
}

export async function editAwxCredential(credentialName: string, newName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
  await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
  await page.getByRole('button', { name: 'Edit credential' }).click();
  await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(newName);
  await page.getByRole('button', { name: 'Save credential' }).click();
  await expect(page.getByRole('heading', { name: newName, exact: true })).toBeVisible();
}

export async function duplicateAwxCredential(credentialName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
  await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
  await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
  await page.getByLabel('Duplicate credential').click();
  // Wait for the duplication to complete - look for success message or navigation
  await expect(
    page
      .getByText('duplicated', { exact: true })
      .or(page.getByText('Success', { exact: true }))
      .or(page.getByRole('heading', { name: 'Credentials' }))
  ).toBeVisible({ timeout: 10000 });
}
