import type { EdaProject as EdaProjectType } from '@ansible/eda-ui/interfaces/EdaProject';
import { Page, expect } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export interface CreateEdaProjectOptions {
  projectName?: string;
  organizationName?: string;
}

export interface CreateEdaProjectAPIOptions {
  name?: string;
  organization: number;
  url?: string;
  description?: string;
}

export const EdaProject = {
  api: {
    create: async (page: Page, options: CreateEdaProjectAPIOptions): Promise<EdaProjectType> => {
      const project = await edaAPI.post<EdaProjectType>(page, 'projects/', {
        name: options.name ?? createE2EName('project'),
        organization_id: options.organization,
        url: options.url ?? 'https://github.com/ansible/ansible-ui',
        description: options.description ?? 'Created via API for E2E testing',
      });

      if (!project) {
        throw new Error('Failed to create EDA project: API returned null');
      }

      return project;
    },

    delete: async (page: Page, projectId: number): Promise<void> => {
      await edaAPI.delete(page, `projects/${projectId}/`);
    },

    deleteByName: async (page: Page, projectName: string): Promise<void> => {
      try {
        const projects = await edaAPI.get<{ results: EdaProjectType[] }>(
          page,
          `projects/?name=${encodeURIComponent(projectName)}`
        );
        if (projects?.results && projects.results.length > 0) {
          await edaAPI.delete(page, `projects/${projects.results[0].id}/`);
        }
      } catch {
        // Already deleted or not found
      }
    },

    get: async (page: Page, projectId: number): Promise<EdaProjectType> => {
      const project = await edaAPI.get<EdaProjectType>(page, `projects/${projectId}/`);
      if (!project) {
        throw new Error(`EDA project ${projectId} not found`);
      }
      return project;
    },

    waitForSync: async (
      page: Page,
      projectId: number,
      timeout: number = 120000
    ): Promise<EdaProjectType> => {
      const startTime = Date.now();
      const checkInterval = 2000;

      while (Date.now() - startTime < timeout) {
        const project = await EdaProject.api.get(page, projectId);

        if (project.import_state === ('completed' as EdaProjectType['import_state'])) {
          return project;
        }

        if (project.import_state === ('failed' as EdaProjectType['import_state'])) {
          throw new Error(`Project ${projectId} sync failed`);
        }

        await page.waitForTimeout(checkInterval);
      }

      throw new Error(`Project ${projectId} sync did not complete within ${timeout}ms timeout`);
    },
  },

  ui: {
    create: async (page: Page, options: CreateEdaProjectOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Decisions', 'Projects');
      await page.getByText('Create project').click();
      const projectName = options.projectName ?? createE2EName('project');
      await page.getByRole('textbox', { name: 'Name' }).fill(projectName);
      const organizationName = options.organizationName;
      await singleSelectByLabel('Organization', organizationName ?? 'Default', page);
      await page.getByLabel('Source Control URL').fill('https://github.com/ansible/ansible-ui');
      await page.getByRole('button', { name: 'Create project', exact: true }).click();
      await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();
      return projectName;
    },

    edit: async (
      page: Page,
      projectName: string,
      updates: {
        name?: string;
        description?: string;
        url?: string;
      }
    ): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Projects');
      await clickTableRow(
        {
          text: projectName,
          pageTitle: 'Projects',
          filterLabel: 'Name',
          filterValue: projectName,
          clearFilters: true,
        },
        page
      );

      await clickPageAction('Edit project', page);
      await expect(page.getByRole('heading', { name: `Edit ${projectName}` })).toBeVisible();

      if (updates.name) {
        await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
        await page.getByRole('textbox', { name: 'Name', exact: true }).fill(updates.name);
      }

      if (updates.description) {
        await page.getByRole('textbox', { name: 'Description' }).clear();
        await page.getByRole('textbox', { name: 'Description' }).fill(updates.description);
      }

      if (updates.url) {
        await page.getByLabel('Source Control URL').clear();
        await page.getByLabel('Source Control URL').fill(updates.url);
      }

      await page.getByRole('button', { name: 'Save project', exact: true }).click();
      await expect(page.getByTestId('page-title')).toHaveText(updates.name || projectName);
    },

    delete: async (page: Page, projectName: string): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Projects');
      await clickTableRow(
        {
          text: projectName,
          pageTitle: 'Projects',
          filterLabel: 'Name',
          filterValue: projectName,
          clearFilters: true,
        },
        page
      );
      await clickPageAction('Delete project', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
