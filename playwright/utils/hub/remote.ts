import { Page } from '@playwright/test';
import { pulpAPI } from '../../commands/apiClient';
import { createE2EName } from '../../commands/createE2EName';

export interface HubRemote {
  pulp_href: string;
  name: string;
  url: string;
}

export interface CreateRemoteOptions {
  name?: string;
  url?: string;
}

export const Remote = {
  api: {
    create: async (page: Page, options: CreateRemoteOptions = {}): Promise<HubRemote> => {
      const remote = await pulpAPI.post<HubRemote>(page, '/remotes/ansible/collection/', {
        name: options.name ?? createE2EName('Remote'),
        url: options.url ?? 'https://console.redhat.com/api/automation-hub/',
      });

      if (!remote) {
        throw new Error('Failed to create Hub remote: API returned null');
      }

      return remote;
    },

    delete: async (page: Page, pulpHref: string): Promise<void> => {
      try {
        await pulpAPI.delete(page, pulpHref, { expectStatus: 204 });
      } catch (error) {
        // Ignore 404 errors (resource already deleted)
        if (error instanceof Error && !error.message.includes('404')) {
          throw error;
        }
      }
    },

    get: async (page: Page, name: string): Promise<HubRemote> => {
      const response = await pulpAPI.get<{ results: HubRemote[] }>(
        page,
        '/remotes/ansible/collection/',
        { params: { name } }
      );

      if (!response || !response.results || response.results.length === 0) {
        throw new Error(`Hub remote "${name}" not found`);
      }

      return response.results[0];
    },
  },

  ui: {},
} as const;
