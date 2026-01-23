import { Page } from '@playwright/test';
import { pulpAPI } from '../../commands/apiClient';
import { createE2EName } from '../../commands/createE2EName';

export interface HubRepository {
  pulp_href: string;
  name: string;
  description?: string;
  retain_repo_versions?: number;
  remote?: string;
}

export interface CreateRepositoryOptions {
  name?: string;
  description?: string;
  remote?: string;
  retain_repo_versions?: number;
}

export const Repository = {
  api: {
    create: async (page: Page, options: CreateRepositoryOptions = {}): Promise<HubRepository> => {
      const repository = await pulpAPI.post<HubRepository>(page, '/repositories/ansible/ansible/', {
        name: options.name ?? createE2EName('Repository'),
        description: options.description ?? null,
        private: false,
        pulp_labels: {},
        remote: options.remote ?? null,
        retain_repo_versions: options.retain_repo_versions ?? 1,
      });

      if (!repository) {
        throw new Error('Failed to create Hub repository: API returned null');
      }

      return repository;
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

    get: async (page: Page, name: string): Promise<HubRepository> => {
      const response = await pulpAPI.get<{ results: HubRepository[] }>(
        page,
        '/repositories/ansible/ansible/',
        { params: { name } }
      );

      if (!response || !response.results || response.results.length === 0) {
        throw new Error(`Hub repository "${name}" not found`);
      }

      return response.results[0];
    },
  },

  // UI methods can be added here later when needed
  ui: {},
} as const;
