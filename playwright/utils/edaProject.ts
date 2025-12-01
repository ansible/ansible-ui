import { Page, expect } from '@playwright/test';
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

export const EdaProject = {
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
