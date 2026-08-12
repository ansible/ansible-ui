import { Page, expect } from '@playwright/test';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { fillMonacoEditor } from '../commands/fillMonacoEditor';
import { selectTableRow } from '../commands/selectTableRow';

export interface CredentialTypeOptions {
  credentialTypeName?: string;
  description?: string;
  inputConfiguration?: string;
  injectorConfiguration?: string;
}

export const CredentialType = {
  ui: {
    create: async (page: Page, options: CredentialTypeOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');
      await page.getByText('Create credential type').click();

      const credentialTypeName = options.credentialTypeName ?? createE2EName('credential-type');
      const description = options.description ?? 'E2E Test Credential Type Description';

      await expect(page.getByPlaceholder('Enter credential type name')).toBeVisible();
      await page.getByPlaceholder('Enter credential type name').fill(credentialTypeName);
      await page.getByPlaceholder('Enter description').fill(description);

      if (options.inputConfiguration) {
        await fillMonacoEditor(
          page,
          options.inputConfiguration,
          page.locator('.monaco-editor').first().getByRole('textbox')
        );
      }

      if (options.injectorConfiguration) {
        await fillMonacoEditor(
          page,
          options.injectorConfiguration,
          page.locator('.monaco-editor').nth(1).getByRole('textbox')
        );
      }

      await page.getByRole('button', { name: 'Create credential type' }).click();
      await expect(
        page.getByRole('heading', { name: credentialTypeName, exact: true })
      ).toBeVisible();

      return credentialTypeName;
    },

    edit: async (
      page: Page,
      credentialTypeName: string,
      updates: { name?: string; description?: string }
    ): Promise<string> => {
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
    },

    bulkDelete: async (page: Page, credentialTypeNames: string[]): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credential Types');

      for (let i = 0; i < credentialTypeNames.length; i++) {
        await selectTableRow(
          {
            filterLabel: 'Name',
            filterValue: credentialTypeNames[i],
            clearFilters: i > 0,
          },
          page
        );
      }

      await page.getByRole('button', { name: 'Actions' }).click();
      await page.getByRole('menuitem', { name: 'Delete credential types' }).click();

      await confirmAndAssertDeletion(page);
    },
  },
} as const;
