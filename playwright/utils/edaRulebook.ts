import type { EdaRulebook as EdaRulebookType } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { Page } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';

export const EdaRulebook = {
  api: {
    /**
     * Get rulebooks for a specific project.
     * Optionally filter by rulebook name.
     */
    getByProject: async (
      page: Page,
      projectId: number,
      name?: string
    ): Promise<EdaRulebookType[]> => {
      const result = await edaAPI.get<{ results: EdaRulebookType[] }>(
        page,
        `/rulebooks/?project_id=${projectId}`
      );

      if (!result || !Array.isArray(result.results)) {
        throw new Error(`Failed to fetch rulebooks for project ${projectId}`);
      }

      if (name) {
        return result.results.filter((rb) => rb.name === name);
      }

      return result.results;
    },

    /**
     * Get a single rulebook by project ID and name.
     * Throws an error if the rulebook is not found.
     */
    getByProjectAndName: async (
      page: Page,
      projectId: number,
      name: string
    ): Promise<EdaRulebookType> => {
      const rulebooks = await EdaRulebook.api.getByProject(page, projectId);

      if (rulebooks.length === 0) {
        throw new Error(`No rulebooks found for project ${projectId}`);
      }

      const rulebook = rulebooks.find((rb) => rb.name === name);

      if (!rulebook) {
        throw new Error(
          `Rulebook '${name}' not found in project ${projectId}. Available rulebooks: ${rulebooks.map((rb) => rb.name).join(', ')}`
        );
      }

      return rulebook;
    },

    get: async (page: Page, rulebookId: number): Promise<EdaRulebookType> => {
      const rulebook = await edaAPI.get<EdaRulebookType>(page, `/rulebooks/${rulebookId}/`);

      if (!rulebook) {
        throw new Error(`Rulebook ${rulebookId} not found`);
      }

      return rulebook;
    },
  },
} as const;
