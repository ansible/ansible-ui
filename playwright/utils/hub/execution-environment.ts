import { Page } from '@playwright/test';
import { hubAPI } from '../../commands/apiClient';
import { createE2EName } from '../../commands/createE2EName';

export interface HubExecutionEnvironment {
  id: string;
  name: string;
  registry: string;
  include_tags: string[];
}

export interface CreateExecutionEnvironmentOptions {
  name?: string;
  registry?: string;
  include_tags?: string[];
  upstream_name?: string;
}

export const ExecutionEnvironment = {
  api: {
    create: async (
      page: Page,
      options: CreateExecutionEnvironmentOptions = {}
    ): Promise<HubExecutionEnvironment> => {
      const executionEnv = await hubAPI.post<HubExecutionEnvironment>(
        page,
        '/_ui/v1/execution-environments/remotes/',
        {
          name: options.name ?? createE2EName('ExecutionEnv'),
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
        `/v3/plugin/execution-environments/repositories/${executionEnvironmentName}/`
      );
    },

    get: async (page: Page, executionEnvironmentName: string): Promise<HubExecutionEnvironment> => {
      const executionEnv = await hubAPI.get<HubExecutionEnvironment>(
        page,
        `/_ui/v1/execution-environments/remotes/${executionEnvironmentName}/`
      );

      if (!executionEnv) {
        throw new Error(`Hub execution environment "${executionEnvironmentName}" not found`);
      }

      return executionEnv;
    },
  },

  ui: {},
} as const;
