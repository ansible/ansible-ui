import { Page, expect } from '@playwright/test';
import { awxAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { expectRowToContain } from '../commands/expectRowToContain';
import { filterTable } from '../commands/filterTable';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export interface ProjectType {
  id: number;
  name: string;
  description?: string;
  organization: number;
  scm_type?: string;
  scm_url?: string;
  url: string;
  created: string;
  modified: string;
}

export interface CreateProjectOptions {
  name?: string;
  description?: string;
  organization: number;
  scm_type?: string;
  scm_url?: string;
}

export interface CreateProjectUIOptions {
  projectName?: string;
  description?: string;
  organizationName: string;
  scmType?: string;
  scmUrl?: string;
}

interface ProjectResponse {
  name: string;
  id: number;
}

function isProjectResponse(obj: unknown): obj is ProjectResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    typeof obj.name === 'string' &&
    'id' in obj &&
    typeof obj.id === 'number'
  );
}

export const Project = {
  api: {
    create: async (page: Page, options: CreateProjectOptions): Promise<ProjectType> => {
      const project = await awxAPI.post<ProjectType>(page, 'projects/', {
        name: options.name ?? createE2EName('Project'),
        description: options.description ?? 'Created via API for E2E testing',
        organization: options.organization,
        scm_type: options.scm_type ?? '',
        scm_url: options.scm_url ?? '',
      });

      if (!project) {
        throw new Error('Failed to create project: API returned null');
      }

      return project;
    },

    delete: async (page: Page, projectId: number): Promise<void> => {
      await awxAPI.delete(page, `projects/${projectId}/`);
    },

    get: async (page: Page, projectId: number): Promise<ProjectType> => {
      const project = await awxAPI.get<ProjectType>(page, `projects/${projectId}/`);

      if (!project) {
        throw new Error(`Project ${projectId} not found`);
      }

      return project;
    },
  },

  ui: {
    create: async (page: Page, options: CreateProjectUIOptions): Promise<string> => {
      await navigateTo(page, 'Automation Execution', 'Projects');
      await page.getByRole('link', { name: 'Create project', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Create project' })).toBeVisible();

      const projectName = options.projectName ?? createE2EName();
      await page.getByTestId('name').fill(projectName);

      if (options.description) {
        await page.getByTestId('description').fill(options.description);
      }

      // Select organization
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
      await page.getByRole('button', { name: 'Select source control type' }).click();
      await page.getByRole('option', { name: 'Git' }).click();
      await page.getByLabel('Source Control URL').fill('https://github.com/ansible/ansible-ui');

      await page.getByRole('button', { name: 'Create project', exact: true }).click();
      await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();

      return projectName;
    },

    edit: async (page: Page, projectName: string, newProjectName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Projects');
      await clickTableRow({ filterLabel: 'Name', text: projectName }, page);
      await page.getByRole('button', { name: 'Edit project', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Edit project' })).toBeVisible();
      await page.getByLabel('Name', { exact: true }).clear();
      await page.getByLabel('Name', { exact: true }).fill(newProjectName);
      await page.getByRole('button', { name: 'Save project', exact: true }).click();
      await expect(page.getByRole('heading', { name: newProjectName, exact: true })).toBeVisible();
    },

    delete: async (page: Page, projectName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Projects');
      await clickTableRow(
        {
          text: projectName,
          filterLabel: 'Name',
          filterValue: projectName,
          clearFilters: true,
        },
        page
      );
      await clickPageAction('Delete project', page);
      await confirmAndAssertDeletion(page);

      // After deletion, manually navigate back to Projects list to ensure we're on the correct page
      await navigateTo(page, 'Automation Execution', 'Projects');
      await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    },

    copy: async (page: Page, projectName: string): Promise<string> => {
      await navigateTo(page, 'Automation Execution', 'Projects');
      await filterTable(
        { filterLabel: 'Name', filterValue: projectName, clearFilters: true },
        page
      );

      // Set up API interception to capture copied project name
      const copyResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/copy/') && response.status() === 201
      );

      // Trigger copy from list row kebab menu
      const row = page.getByRole('row').filter({ hasText: projectName });
      await row.getByLabel('kebab dropdown toggle').click();
      await page.getByRole('menuitem', { name: 'Duplicate project' }).click();

      // Get the exact copied name from API response
      const copyResponse = await copyResponsePromise;
      const responseData: unknown = await copyResponse.json();

      if (!isProjectResponse(responseData)) {
        throw new Error('Invalid project response from API');
      }

      // Wait for success alert to appear (copy from list stays on list page)
      await expect(page.getByTestId('alert-toaster')).toContainText('duplicated', {
        timeout: 10000,
      });

      return responseData.name;
    },

    sync: async (page: Page, projectName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Projects');
      await filterTable(
        { filterLabel: 'Name', filterValue: projectName, clearFilters: true },
        page
      );
      await expectRowToContain(projectName, 'Success', page, 60 * 1000);
    },
  },
} as const;
