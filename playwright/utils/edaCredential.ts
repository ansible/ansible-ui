import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export interface CreateEdaCredentialOptions {
  credentialName?: string;
  organizationName?: string;
}

export const EdaCredential = {
  ui: {
    create: async (page: Page, options: CreateEdaCredentialOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential').click();
      const credentialName = options.credentialName ?? createE2EName('credential');
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Red Hat Ansible Automation');
      await page.getByRole('option', { name: 'Red Hat Ansible Automation' }).click();
      await page
        .getByRole('textbox', { name: 'Red Hat Ansible Automation' })
        .fill('https://1.1.1.1/');
      await page.getByRole('textbox', { name: 'Username' }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill('test');
      await page.getByRole('textbox', { name: 'Password' }).click();
      await page.getByRole('textbox', { name: 'Password' }).fill('test');
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      return credentialName;
    },

    createEventStreamCredential: async (
      page: Page,
      options: CreateEdaCredentialOptions = {}
    ): Promise<string> => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential').click();
      const credentialName = options.credentialName ?? createE2EName('credential');
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Basic Event Stream');
      await page.getByRole('option', { name: 'Basic Event Stream' }).click();
      await page.getByRole('textbox', { name: 'Username' }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill('test');
      await page.getByRole('textbox', { name: 'Password' }).click();
      await page.getByRole('textbox', { name: 'Password' }).fill('test');
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();
      return credentialName;
    },

    delete: async (page: Page, credentialName: string): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await clickTableRow(
        {
          text: credentialName,
          pageTitle: 'Credentials',
          filterLabel: 'Name',
          filterValue: credentialName,
          clearFilters: true,
        },
        page
      );
      await clickPageAction('Delete credential', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
