import { Page, expect } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';

export interface CreateEdaCredentialTypeOptions {
  credentialTypeName?: string;
  inputType?: string;
}

export interface CreateEdaCredentialTypeAPIOptions {
  name?: string;
  description?: string;
  inputs?: Record<string, unknown>;
  injectors?: Record<string, unknown>;
}

export interface EdaCredentialTypeResponse {
  id: number;
  name: string;
  description?: string;
  inputs?: Record<string, unknown>;
  injectors?: Record<string, unknown>;
  managed?: boolean;
}

export const EdaCredentialType = {
  api: {
    create: async (
      page: Page,
      options: CreateEdaCredentialTypeAPIOptions = {}
    ): Promise<EdaCredentialTypeResponse> => {
      const name = options.name ?? createE2EName('credential_type');
      const credentialType = (await edaAPI.post(page, '/credential-types/', {
        name,
        description: options.description ?? '',
        inputs: options.inputs ?? {
          fields: [
            {
              id: 'username',
              type: 'string',
              label: 'Username',
            },
          ],
        },
        injectors: options.injectors ?? {},
      })) as EdaCredentialTypeResponse;
      return credentialType;
    },

    delete: async (page: Page, credentialTypeId: number): Promise<void> => {
      try {
        await edaAPI.delete(page, `credential-types/${credentialTypeId}/`);
      } catch (error) {
        if (error instanceof Error && !error.message.includes('404')) {
          throw error;
        }
      }
    },

    deleteByName: async (page: Page, credentialTypeName: string): Promise<void> => {
      try {
        const credentialTypes = await edaAPI.get<{ results: EdaCredentialTypeResponse[] }>(
          page,
          `credential-types/?name=${encodeURIComponent(credentialTypeName)}`
        );
        if (credentialTypes?.results && credentialTypes.results.length > 0) {
          await edaAPI.delete(page, `credential-types/${credentialTypes.results[0].id}/`);
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes('404')) {
          throw error;
        }
      }
    },
  },

  ui: {
    create: async (page: Page, options: CreateEdaCredentialTypeOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
      await page.getByText('Create credential type').click();
      const credentialTypeName = options.credentialTypeName ?? createE2EName('credential_type');
      await page.getByPlaceholder('Enter credential type name').fill(credentialTypeName);
      await page.locator('.view-lines').first().click();
      await page
        .locator('#inputs')
        .getByRole('textbox', { name: 'Editor content' })
        .fill(
          options?.inputType ??
            JSON.stringify({
              fields: [
                {
                  id: 'auth_type',
                  type: 'string',
                  label: 'Event Stream Authentication Type',
                  hidden: true,
                  default: 'basic',
                },
                {
                  id: 'username',
                  type: 'string',
                  label: 'Username',
                  help_text: 'The username used to authenticate the incoming event stream',
                },
                {
                  id: 'password',
                  type: 'string',
                  label: 'Password',
                  secret: true,
                  help_text: 'The password used to authenticate the incoming event stream',
                },
              ],
            })
        );
      await page.getByRole('button', { name: 'Create credential type' }).click();
      await expect(
        page.getByRole('heading', { name: credentialTypeName, exact: true })
      ).toBeVisible();
      return credentialTypeName;
    },

    delete: async (page: Page, credentialTypeName: string): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
      await clickTableRow(
        {
          text: credentialTypeName,
          pageTitle: 'Credential Types',
          filterLabel: 'Name',
          filterValue: credentialTypeName,
          clearFilters: true,
        },
        page
      );
      await clickPageAction('Delete credential type', page);
      await confirmAndAssertDeletion(page);
    },
  },
};
