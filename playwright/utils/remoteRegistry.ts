import { Page, expect } from '@playwright/test';
import { hubAPI } from '../commands/apiClient';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { clickTableRow } from '../commands/clickTableRow';
import { deleteResourceFromDetailsPage } from '../commands/deleteResourceFromDetailsPage';

export interface RemoteRegistry {
  id: string;
  name: string;
  url: string;
}

export interface HubItemsResponse<T> {
  data: T[];
  meta: {
    count: number;
  };
}

export interface CreateRemoteRegistryOptions {
  name?: string;
  url?: string;
}

export interface CreateRemoteRegistryUIOptions {
  remoteRegistryName?: string;
  url?: string;
}

export const RemoteRegistry = {
  api: {
    create: async (
      page: Page,
      options: CreateRemoteRegistryOptions = {}
    ): Promise<RemoteRegistry> => {
      const remoteRegistry = await hubAPI.post<RemoteRegistry>(
        page,
        '_ui/v1/execution-environments/registries/',
        {
          name: options.name ?? createE2EName('remote-registry'),
          url: options.url ?? 'https://console.redhat.com/api/automation-hub/',
        }
      );

      if (!remoteRegistry) {
        throw new Error('Failed to create remote registry: API returned null');
      }

      return remoteRegistry;
    },

    delete: async (page: Page, remoteRegistryId: string): Promise<void> => {
      await hubAPI.delete(page, `_ui/v1/execution-environments/registries/${remoteRegistryId}/`, {
        expectStatus: 204,
      });
    },

    get: async (page: Page, name: string): Promise<RemoteRegistry | null> => {
      const response = await hubAPI.get<HubItemsResponse<RemoteRegistry>>(
        page,
        `_ui/v1/execution-environments/registries/`,
        {
          params: { name__icontains: name },
        }
      );

      if (!response || response.data.length === 0) {
        return null;
      }

      return response.data[0];
    },
  },

  ui: {
    create: async (page: Page, options: CreateRemoteRegistryUIOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Content', 'Remote Registries');

      // Check if the create button exists in the empty state or toolbar
      const createButtonLocator = page.getByTestId('create-remote-registry');
      const emptyStateLink = page.getByRole('link', { name: 'Create remote registry' });

      if (await emptyStateLink.isVisible().catch(() => false)) {
        await emptyStateLink.click();
      } else {
        await createButtonLocator.click();
      }

      await expect(page.getByRole('heading', { name: 'Create remote registry' })).toBeVisible();

      const remoteRegistryName = options.remoteRegistryName ?? createE2EName('remote-registry');
      await page.getByTestId('name').fill(remoteRegistryName);
      await page
        .getByTestId('url')
        .fill(options.url ?? 'https://console.redhat.com/api/automation-hub/');

      await page.getByTestId('Submit').click();

      await expect(
        page.getByRole('heading', { name: remoteRegistryName, exact: true })
      ).toBeVisible();

      return remoteRegistryName;
    },

    delete: async (page: Page, remoteRegistryName: string): Promise<void> => {
      await deleteResourceFromDetailsPage(
        {
          resourceName: remoteRegistryName,
          resourceType: 'remote registry',
          filterLabel: 'Name',
          navigationPath: ['Automation Content', 'Remote Registries'],
        },
        page
      );
    },

    edit: async (page: Page, remoteRegistryName: string, newUrl: string): Promise<void> => {
      await navigateTo(page, 'Automation Content', 'Remote Registries');
      await clickTableRow({ filterLabel: 'Name', text: remoteRegistryName }, page);

      await page.getByTestId('actions-dropdown').click();
      await page.getByTestId('edit-remote-registry').click({ force: true });

      await expect(page.getByRole('heading', { name: `Edit ${remoteRegistryName}` })).toBeVisible();

      await page.getByTestId('url').clear();
      await page.getByTestId('url').fill(newUrl);

      await page.getByRole('button', { name: 'Save remote registry', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: remoteRegistryName, exact: true })
      ).toBeVisible();
    },
  },
} as const;
