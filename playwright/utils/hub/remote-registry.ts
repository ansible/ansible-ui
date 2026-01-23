import { Page } from '@playwright/test';
import { hubAPI } from '../../commands/apiClient';
import { createE2EName } from '../../commands/createE2EName';

export interface HubRemoteRegistry {
  id: string;
  name: string;
  url: string;
}

export interface CreateRemoteRegistryOptions {
  name?: string;
  url?: string;
}

export const RemoteRegistry = {
  api: {
    create: async (
      page: Page,
      options: CreateRemoteRegistryOptions = {}
    ): Promise<HubRemoteRegistry> => {
      const registry = await hubAPI.post<HubRemoteRegistry>(
        page,
        '/_ui/v1/execution-environments/registries/',
        {
          name: options.name ?? createE2EName('Registry'),
          url: options.url ?? 'https://quay.io/',
        }
      );

      if (!registry) {
        throw new Error('Failed to create Hub remote registry: API returned null');
      }

      return registry;
    },

    delete: async (page: Page, registryId: string): Promise<void> => {
      await hubAPI.delete(page, `/_ui/v1/execution-environments/registries/${registryId}/`);
    },

    get: async (page: Page, registryId: string): Promise<HubRemoteRegistry> => {
      const registry = await hubAPI.get<HubRemoteRegistry>(
        page,
        `/_ui/v1/execution-environments/registries/${registryId}/`
      );

      if (!registry) {
        throw new Error(`Hub remote registry "${registryId}" not found`);
      }

      return registry;
    },
  },

  ui: {},
} as const;
