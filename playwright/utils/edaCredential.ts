import type { EdaCredential as EdaCredentialInterface } from '@ansible/eda-ui/interfaces/EdaCredential';
import { Page, expect } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export interface CreateEdaCredentialOptions {
  credentialName?: string;
  organizationName?: string;
  credentialTypeName?: string;
}

export interface CreateEdaCredentialAPIOptions {
  name: string;
  organizationName?: string;
  credentialTypeName: string;
  description?: string;
  inputs?: Record<string, unknown>;
}

export const EdaCredential = {
  api: {
    create: async (
      page: Page,
      options: CreateEdaCredentialAPIOptions
    ): Promise<EdaCredentialInterface> => {
      const organizationName = options.organizationName ?? 'Default';
      const organizations = await edaAPI.get<{ results: { id: number; name: string }[] }>(
        page,
        `organizations/?name=${encodeURIComponent(organizationName)}`
      );
      if (!organizations?.results || organizations.results.length === 0) {
        throw new Error(`Organization '${organizationName}' not found`);
      }
      const organizationId = organizations.results[0].id;

      const credentialTypes = await edaAPI.get<{ results: { id: number; name: string }[] }>(
        page,
        `credential-types/?name=${encodeURIComponent(options.credentialTypeName)}`
      );
      if (!credentialTypes?.results || credentialTypes.results.length === 0) {
        throw new Error(`Credential type '${options.credentialTypeName}' not found`);
      }
      const credentialTypeId = credentialTypes.results[0].id;

      const credential = (await edaAPI.post(page, '/eda-credentials/', {
        name: options.name,
        organization_id: organizationId,
        credential_type_id: credentialTypeId,
        description: options.description,
        inputs: options.inputs || {},
      })) as EdaCredentialInterface;

      return credential;
    },

    delete: async (page: Page, credentialId: number): Promise<void> => {
      try {
        await edaAPI.delete(page, `eda-credentials/${credentialId}/`);
      } catch {
        // Already deleted or not found
      }
    },

    deleteByName: async (page: Page, credentialName: string): Promise<void> => {
      try {
        const credentials = await edaAPI.get<{ results: EdaCredentialInterface[] }>(
          page,
          `eda-credentials/?name=${encodeURIComponent(credentialName)}`
        );
        if (credentials?.results && credentials.results.length > 0) {
          await edaAPI.delete(page, `eda-credentials/${credentials.results[0].id}/`);
        }
      } catch {
        // Already deleted or not found
      }
    },
  },

  ui: {
    create: async (page: Page, options: CreateEdaCredentialOptions = {}): Promise<string> => {
      const credentialTypeName = options.credentialTypeName ?? 'Red Hat Ansible Automation';

      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential').click();
      const credentialName = options.credentialName ?? createE2EName('credential');
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialTypeName);
      await page.getByRole('option', { name: credentialTypeName }).click();

      // Only fill credential fields for known types that require them
      if (credentialTypeName === 'Red Hat Ansible Automation') {
        await page
          .getByRole('textbox', { name: 'Red Hat Ansible Automation' })
          .fill('https://1.1.1.1/');
        await page.getByRole('textbox', { name: 'Username' }).click();
        await page.getByRole('textbox', { name: 'Username' }).fill('test');
        await page.getByRole('textbox', { name: 'Password' }).click();
        await page.getByRole('textbox', { name: 'Password' }).fill('test');
      } else if (credentialTypeName === 'Event-Driven Ansible Rule Engine') {
        // Rule Engine credentials require Postgres DB Host and DB Name
        await page.getByRole('textbox', { name: 'Postgres DB Host' }).fill('localhost');
        await page.getByRole('textbox', { name: 'Postgres DB Name' }).fill('test_db');
      }

      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible({
        timeout: 10000,
      });
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
