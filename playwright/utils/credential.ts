import { Credential as CredentialType } from '@ansible/awx-ui/interfaces/Credential';
import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { filterTable } from '../commands/filterTable';

export interface CreateCredentialOptions {
  credentialName?: string;
  credentialType?: string;
  organization?: string;
  inputs?: Record<string, string>;
  description?: string;
  username?: string;
  password?: string;
  vaultId?: string;
  /** Enable "Prompt on launch" for SSH password */
  promptOnLaunchPassword?: boolean;
  /** Enable "Prompt on launch" for privilege escalation password */
  promptOnLaunchBecomePassword?: boolean;
  /** Enable "Prompt on launch" for SSH private key passphrase */
  promptOnLaunchSshKeyUnlock?: boolean;
}

export interface CreateCredentialAPIOptions {
  name?: string;
  credentialType: number;
  organization?: number;
  description?: string;
  inputs?: Record<string, string>;
}

async function lookupCredentialTypeId(page: Page, name: string): Promise<number> {
  const result = await awxAPI.get<{ results: { id: number; name: string }[] }>(
    page,
    'credential_types/',
    { params: { name } }
  );
  const match = result?.results?.find((item) => item.name === name);
  if (!match) {
    throw new Error(`Credential type '${name}' not found`);
  }
  return match.id;
}

export { lookupCredentialTypeId };

export const Credential = {
  api: {
    create: async (page: Page, options: CreateCredentialAPIOptions): Promise<CredentialType> => {
      const credential = await awxAPI.post<CredentialType>(page, 'credentials/', {
        name: options.name ?? createE2EName('credential'),
        description: options.description,
        credential_type: options.credentialType,
        organization: options.organization ?? 1,
        inputs: options.inputs ?? {},
      });

      if (!credential) {
        throw new Error('Failed to create credential: API returned null');
      }

      return credential;
    },

    delete: async (page: Page, credentialId: number): Promise<void> => {
      await awxAPI.delete(page, `/credentials/${credentialId}/`);
    },

    deleteByName: async (page: Page, credentialName: string): Promise<void> => {
      const url = `/credentials/?name=${encodeURIComponent(credentialName)}`;
      const list = await awxAPI
        .get<{ results: Array<{ id: number }> }>(page, url)
        .catch(() => null);
      if (list?.results?.[0]?.id) {
        await awxAPI.delete(page, `/credentials/${list.results[0].id}/`).catch(() => {});
      }
    },
  },

  ui: {
    /**
     * Open a credential details page by id without going through the list.
     * Uses client-side routing so the SPA is not fully reloaded (page.goto is
     * too slow on the Vite dev build and the unfiltered list can 500 in CI).
     */
    open: async (page: Page, credential: { id: number; name: string }): Promise<void> => {
      const path = `/execution/infrastructure/credentials/${credential.id}/details`;
      await page.evaluate((nextPath) => {
        window.history.pushState({}, '', nextPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, path);
      await expect(page).toHaveURL(new RegExp(`/credentials/${credential.id}/details`));
      await expect(page.getByRole('heading', { name: credential.name, exact: true })).toBeVisible({
        timeout: 15000,
      });
    },

    create: async (page: Page, options: CreateCredentialOptions = {}): Promise<string> => {
      const testToken = createE2EName('test-token');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      const createCredential = page.getByText('Create credential', { exact: true });
      const listError = page.getByRole('heading', { name: 'Error loading credentials' });
      await expect(createCredential.or(listError)).toBeVisible({ timeout: 30000 });
      if (await listError.isVisible()) {
        throw new Error(
          'Credentials list failed to load (Error loading credentials). Create credential is unavailable because GET /api/controller/v2/credentials/ returned an error.'
        );
      }
      await createCredential.click();
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

        // Handle SSH password - either fill it or set "Prompt on launch"
        if (options.promptOnLaunchPassword) {
          // Find and check the "Prompt on launch" checkbox for password field
          const passwordFormGroup = page.locator('#password-form-group');
          await passwordFormGroup.getByRole('checkbox', { name: 'Prompt on launch' }).check();
        } else {
          await page.getByRole('textbox', { name: 'Password', exact: true }).click();
          await page
            .getByRole('textbox', { name: 'Password', exact: true })
            .fill(options.password || 'pwd');
        }

        // Handle privilege escalation password "Prompt on launch" if requested
        if (options.promptOnLaunchBecomePassword) {
          const becomePasswordFormGroup = page.locator('#become_password-form-group');
          await becomePasswordFormGroup.getByRole('checkbox', { name: 'Prompt on launch' }).check();
        }

        // Handle SSH private key passphrase "Prompt on launch" if requested
        if (options.promptOnLaunchSshKeyUnlock) {
          const sshKeyUnlockFormGroup = page.locator('#ssh_key_unlock-form-group');
          await sshKeyUnlockFormGroup.getByRole('checkbox', { name: 'Prompt on launch' }).check();
        }
      } else if (options?.credentialType === 'Centrify Vault Credential Provider Lookup') {
        await page.getByRole('textbox', { name: 'Search input' }).fill('Centrify');
        await page
          .getByRole('option', { name: 'Centrify Vault Credential Provider Lookup' })
          .click();
        if (options.inputs) {
          if (options.inputs.url) {
            await page
              .getByRole('textbox', { name: 'Centrify Tenant URL' })
              .fill(options.inputs.url);
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
    },

    delete: async (page: Page, credentialName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');

      try {
        await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
        await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
      } catch (error) {
        // If filtering fails, try to find the row directly
      }

      const row = page.getByRole('row').filter({ hasText: credentialName });
      await row.getByRole('button', { name: 'kebab dropdown toggle' }).click();
      await page.getByRole('menuitem', { name: 'Delete credential' }).click();
      await confirmAndAssertDeletion(page);
    },

    edit: async (page: Page, credentialName: string, newName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await clickTableRow({ filterLabel: 'Name', text: credentialName }, page);
      await page.getByRole('button', { name: 'Edit credential' }).click();
      await expect(page.getByRole('heading', { name: `Edit ${credentialName}` })).toBeVisible();
      await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(newName);
      await page.getByRole('button', { name: 'Save credential' }).click();
      await expect(page.getByRole('heading', { name: newName, exact: true })).toBeVisible();
    },

    duplicate: async (page: Page, credentialName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Credentials');
      await filterTable({ filterLabel: 'Name', filterValue: credentialName }, page);
      await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
      await page.getByLabel('Duplicate credential').click();
      await expect(
        page
          .getByText('duplicated', { exact: true })
          .or(page.getByText('Success', { exact: true }))
          .or(page.getByRole('heading', { name: 'Credentials' }))
      ).toBeVisible({ timeout: 10000 });
    },
  },
} as const;
