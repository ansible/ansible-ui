import { Page, expect } from '@playwright/test';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../commands/createE2EName';
import { navigateTo } from '../../../../../commands/navigateTo';
import { selectTableRow } from '../../../../../commands/selectTableRow';

export interface AwxCredentialTypeOptions {
  credentialTypeName?: string;
  description?: string;
  inputConfiguration?: string;
  injectorConfiguration?: string;
}

export async function createAwxCredentialType(options: AwxCredentialTypeOptions, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
  await page.getByText('Create credential type').click();

  const credentialTypeName = options.credentialTypeName ?? createE2EName('credential-type');
  const description = options.description ?? 'E2E Test Credential Type Description';

  await expect(page.getByPlaceholder('Enter credential type name')).toBeVisible();
  await page.getByPlaceholder('Enter credential type name').fill(credentialTypeName);
  await page.getByPlaceholder('Enter description').fill(description);

  // Add input configuration if provided (Monaco editor)
  if (options.inputConfiguration) {
    await page.locator('.view-lines').first().click();
    const inputEditor = page.locator('.monaco-editor').first().getByRole('textbox');
    await inputEditor.fill(options.inputConfiguration);
  }

  // Add injector configuration if provided (Monaco editor)
  if (options.injectorConfiguration) {
    await page.locator('.view-lines').nth(1).click();
    const injectorEditor = page.locator('.monaco-editor').nth(1).getByRole('textbox');
    await injectorEditor.fill(options.injectorConfiguration);
  }

  await page.getByRole('button', { name: 'Create credential type' }).click();
  await expect(page.getByRole('heading', { name: credentialTypeName, exact: true })).toBeVisible();

  return credentialTypeName;
}

export async function editAwxCredentialType(
  credentialTypeName: string,
  updates: { name?: string; description?: string },
  page: Page
) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
  await clickTableRow({ filterLabel: 'Name', text: credentialTypeName }, page);
  await page.getByRole('button', { name: 'Edit credential type' }).click();

  await expect(page.getByRole('heading', { name: `Edit ${credentialTypeName}` })).toBeVisible();

  if (updates.name) {
    await page.getByPlaceholder('Enter credential type name').clear();
    await page.getByPlaceholder('Enter credential type name').fill(updates.name);
  }

  if (updates.description) {
    await page.getByPlaceholder('Enter description').clear();
    await page.getByPlaceholder('Enter description').fill(updates.description);
  }

  await page.getByRole('button', { name: 'Save credential type' }).click();

  const updatedName = updates.name ?? credentialTypeName;
  await expect(page.getByRole('heading', { name: updatedName, exact: true })).toBeVisible();

  if (updates.description) {
    await expect(page.getByTestId('description')).toContainText(updates.description);
  }

  return updatedName;
}

export async function bulkDeleteAwxCredentialTypes(credentialTypeNames: string[], page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');

  // Select all credential types using selectTableRow with clearFilters option
  for (let i = 0; i < credentialTypeNames.length; i++) {
    await selectTableRow(
      {
        filterLabel: 'Name',
        filterValue: credentialTypeNames[i],
        clearFilters: i > 0, // Clear filters for all items after the first
      },
      page
    );
  }

  await page.getByRole('button', { name: 'Actions' }).click();
  await page.getByRole('menuitem', { name: 'Delete credential types' }).click();

  await confirmAndAssertDeletion(page);
}
