import { Page } from '@playwright/test';
import { pulpAPI } from '../../commands/apiClient';
import { createE2EName } from '../../commands/createE2EName';

export interface HubRemote {
  auth_url?: string | null;
  ca_cert?: string | null;
  client_cert: string | null;
  download_concurrency: number | null;
  name: string;
  proxy_url?: string | null;
  pulp_href: string;
  pulp_created: string;
  rate_limit: number | null;
  requirements_file?: string | null;
  tls_validation: boolean;
  url: string;
  signed_only: boolean;
  sync_dependencies: boolean;
  hidden_fields?: {
    is_set: boolean;
    name: 'client_key' | 'password' | 'proxy_username' | 'proxy_password' | 'token' | 'username';
  }[];
}

export interface CreateRemoteOptions {
  name?: string;
  url?: string;
  ca_cert?: string | null;
  client_cert?: string | null;
  requirements_file?: string | null;
  signed_only?: boolean;
  sync_dependencies?: boolean;
  username?: string;
  password?: string;
  token?: string;
  auth_url?: string | null;
  proxy_url?: string | null;
  proxy_username?: string;
  proxy_password?: string;
  download_concurrency?: number | null;
  rate_limit?: number | null;
  tls_validation?: boolean;
  client_key?: string;
}

export const Remote = {
  api: {
    create: async (page: Page, options: CreateRemoteOptions = {}): Promise<HubRemote> => {
      const payload: Record<string, unknown> = {
        name: options.name ?? createE2EName('Remote'),
        url: options.url ?? 'https://console.redhat.com/api/automation-hub/',
      };

      // Add optional fields only if provided
      if (options.ca_cert !== undefined) payload.ca_cert = options.ca_cert;
      if (options.client_cert !== undefined) payload.client_cert = options.client_cert;
      if (options.client_key !== undefined) payload.client_key = options.client_key;
      if (options.requirements_file !== undefined)
        payload.requirements_file = options.requirements_file;
      if (options.signed_only !== undefined) payload.signed_only = options.signed_only;
      if (options.sync_dependencies !== undefined)
        payload.sync_dependencies = options.sync_dependencies;
      if (options.username !== undefined) payload.username = options.username;
      if (options.password !== undefined) payload.password = options.password;
      if (options.token !== undefined) payload.token = options.token;
      if (options.auth_url !== undefined) payload.auth_url = options.auth_url;
      if (options.proxy_url !== undefined) payload.proxy_url = options.proxy_url;
      if (options.proxy_username !== undefined) payload.proxy_username = options.proxy_username;
      if (options.proxy_password !== undefined) payload.proxy_password = options.proxy_password;
      if (options.download_concurrency !== undefined)
        payload.download_concurrency = options.download_concurrency;
      if (options.rate_limit !== undefined) payload.rate_limit = options.rate_limit;
      if (options.tls_validation !== undefined) payload.tls_validation = options.tls_validation;

      const remote = await pulpAPI.post<HubRemote>(page, '/remotes/ansible/collection/', payload);

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

  // UI methods can be added here later when needed
  ui: {},
} as const;
