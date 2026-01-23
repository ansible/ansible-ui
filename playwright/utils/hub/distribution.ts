import { Page } from '@playwright/test';
import { pulpAPI, constructURL } from '../../commands/apiClient';
import { createE2EName } from '../../commands/createE2EName';
import { waitForHubTask } from './task-utils';

export interface HubRepositoryDistribution {
  pulp_href: string;
  name: string;
  base_path: string;
  repository: string;
}

export interface CreateDistributionOptions {
  name?: string;
  repository: string;
  base_path?: string;
}

export const Distribution = {
  api: {
    create: async (
      page: Page,
      options: CreateDistributionOptions
    ): Promise<HubRepositoryDistribution> => {
      const name = options.name ?? createE2EName('Distribution');
      const base_path = options.base_path ?? createE2EName().toLowerCase().replace(/\s/g, '-');

      // Distribution creation returns 202 with a task
      const taskResponse = await pulpAPI.post<{ task: string }>(
        page,
        '/distributions/ansible/ansible/',
        {
          name,
          base_path,
          repository: options.repository,
        },
        { expectStatus: 202 }
      );

      if (!taskResponse || !taskResponse.task) {
        throw new Error('Failed to create Hub distribution: No task returned');
      }

      // Wait for the task to complete
      const task = await waitForHubTask(page, taskResponse.task);

      // Get the created distribution
      if (!task.created_resources || task.created_resources.length === 0) {
        throw new Error('Failed to create Hub distribution: No resources created');
      }

      const distributionHref = task.created_resources[0];

      // Fetch the distribution using the full URL
      const response = await page.request.get(constructURL(distributionHref));
      if (response.status() !== 200) {
        throw new Error(`Failed to fetch created Hub distribution: ${response.status()}`);
      }

      const distribution = (await response.json()) as HubRepositoryDistribution;
      return distribution;
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

    get: async (page: Page, name: string): Promise<HubRepositoryDistribution> => {
      const response = await pulpAPI.get<{ results: HubRepositoryDistribution[] }>(
        page,
        '/distributions/ansible/ansible/',
        { params: { name } }
      );

      if (!response || !response.results || response.results.length === 0) {
        throw new Error(`Hub distribution "${name}" not found`);
      }

      return response.results[0];
    },
  },

  ui: {},
} as const;
