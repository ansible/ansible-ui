import type { EdaOrganization as EdaOrganizationType } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { Page } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';

export const EdaOrganization = {
  api: {
    /**
     * Get EDA organization by platform organization's ansible_id.
     * Polls for up to 30 seconds since EDA org creation may lag behind platform org.
     */
    getByAnsibleId: async (page: Page, ansibleId: string): Promise<EdaOrganizationType> => {
      if (!ansibleId) {
        throw new Error('ansibleId is required');
      }

      // Poll for the EDA organization to be created (it may take a moment after platform org creation)
      for (let i = 0; i < 30; i++) {
        const result = await edaAPI.get<{ results: EdaOrganizationType[] }>(
          page,
          `/organizations/?resource__ansible_id=${ansibleId}`
        );

        if (result?.results && result.results.length > 0) {
          return result.results[0];
        }

        await page.waitForTimeout(1000);
      }

      throw new Error(`EDA organization not found for ansible_id: ${ansibleId}`);
    },

    get: async (page: Page, organizationId: number): Promise<EdaOrganizationType> => {
      const organization = await edaAPI.get<EdaOrganizationType>(
        page,
        `/organizations/${organizationId}/`
      );

      if (!organization) {
        throw new Error(`EDA organization ${organizationId} not found`);
      }

      return organization;
    },
  },
} as const;
