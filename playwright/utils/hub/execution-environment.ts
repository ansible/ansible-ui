import { Page } from '@playwright/test';
import { hubAPI } from '../../commands/apiClient';
import { createE2EName } from '../../commands/createE2EName';
import { HubItemsResponse } from '../remoteRegistry';
import { waitForHubTask } from './task-utils';

export interface HubExecutionEnvironment {
  id: string;
  name: string;
  registry: string;
  include_tags: string[];
}

export interface ExecutionEnvironmentImage {
  digest: string;
  tags: string[];
  updated_at: string;
  layers: Array<{ size: number }>;
}

export interface CreateExecutionEnvironmentOptions {
  name?: string;
  registry?: string;
  include_tags?: string[];
  upstream_name?: string;
}

export const ExecutionEnvironment = {
  api: {
    list: async (
      page: Page,
      options: { limit?: number } = {}
    ): Promise<HubItemsResponse<HubExecutionEnvironment> | null> => {
      return hubAPI.get<HubItemsResponse<HubExecutionEnvironment>>(
        page,
        `v3/plugin/execution-environments/repositories/`,
        { params: { limit: options.limit ?? 10 } }
      );
    },

    listImages: async (
      page: Page,
      executionEnvironmentName: string,
      options: { limit?: number } = {}
    ): Promise<HubItemsResponse<ExecutionEnvironmentImage> | null> => {
      return hubAPI.get<HubItemsResponse<ExecutionEnvironmentImage>>(
        page,
        `v3/plugin/execution-environments/repositories/${encodeURIComponent(executionEnvironmentName)}/_content/images/`,
        { params: { exclude_child_manifests: 'true', offset: 0, limit: options.limit ?? 10 } }
      );
    },

    create: async (
      page: Page,
      options: CreateExecutionEnvironmentOptions = {}
    ): Promise<HubExecutionEnvironment> => {
      const name = options.name ?? createE2EName('ee', { noWhitespace: true }).toLowerCase();

      const executionEnv = await hubAPI.post<HubExecutionEnvironment>(
        page,
        '/_ui/v1/execution-environments/remotes/',
        {
          name,
          upstream_name: options.upstream_name ?? 'pulp/pulp-fixtures',
          include_tags: options.include_tags ?? ['latest'],
          registry: options.registry ?? '',
        }
      );

      if (!executionEnv) {
        throw new Error('Failed to create Hub execution environment: API returned null');
      }

      return executionEnv;
    },

    delete: async (page: Page, executionEnvironmentName: string): Promise<void> => {
      await hubAPI.delete(
        page,
        `/v3/plugin/execution-environments/repositories/${encodeURIComponent(executionEnvironmentName)}/`,
        {
          expectStatus: 202,
        }
      );
    },

    get: async (page: Page, executionEnvironmentName: string): Promise<HubExecutionEnvironment> => {
      const executionEnv = await hubAPI.get<HubExecutionEnvironment>(
        page,
        `/_ui/v1/execution-environments/remotes/${encodeURIComponent(executionEnvironmentName)}/`
      );

      if (!executionEnv) {
        throw new Error(`Hub execution environment "${executionEnvironmentName}" not found`);
      }

      return executionEnv;
    },
    sync: async (page: Page, executionEnvironmentName: string): Promise<void> => {
      const response = await hubAPI.post<{ task: string }>(
        page,
        `v3/plugin/execution-environments/repositories/${encodeURIComponent(executionEnvironmentName)}/_content/sync/`,
        {},
        { expectStatus: 202 }
      );

      if (!response?.task) {
        throw new Error('Failed to sync execution environment: no task returned');
      }

      // Wait for the sync task to complete with extended timeout (syncing can take a while)
      await waitForHubTask(page, response.task, { timeout: 120000 });
    },
  },
  ui: {},
} as const;
