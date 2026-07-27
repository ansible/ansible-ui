import { Application } from '@ansible/awx-ui/interfaces/Application';
import { Page } from '@playwright/test';
import { gatewayAPI } from '../commands/apiClient';
import { createE2EName } from '../commands/createE2EName';

export interface CreateOAuthApplicationOptions {
  name?: string;
  description?: string;
  organization: number;
  authorization_grant_type?: 'authorization-code' | 'password';
  client_type?: 'confidential' | 'public';
  redirect_uris?: string;
  algorithm?: '' | 'RS256' | 'HS256';
  skip_authorization?: boolean;
  pkce_required?: boolean;
  post_logout_redirect_uris?: string;
}

export const OAuthApplication = {
  api: {
    create: async (page: Page, options: CreateOAuthApplicationOptions): Promise<Application> => {
      const application = await gatewayAPI.post<Application>(page, 'applications/', {
        name: options.name ?? createE2EName('OAuth App'),
        description: options.description ?? 'Created via API for E2E testing',
        organization: options.organization,
        authorization_grant_type: options.authorization_grant_type ?? 'password',
        client_type: options.client_type ?? 'confidential',
        redirect_uris: options.redirect_uris ?? '',
        algorithm: options.algorithm ?? '',
        skip_authorization: options.skip_authorization ?? false,
        post_logout_redirect_uris: options.post_logout_redirect_uris ?? '',
        ...(options.pkce_required !== undefined && { pkce_required: options.pkce_required }),
      });

      if (!application) {
        throw new Error('Failed to create OAuth application: API returned null');
      }

      return application;
    },

    delete: async (page: Page, applicationId: number): Promise<void> => {
      await gatewayAPI.delete(page, `applications/${applicationId}/`);
    },
  },
} as const;
