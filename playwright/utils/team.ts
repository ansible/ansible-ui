import { Page, expect } from '@playwright/test';
import { gatewayAPI } from '../commands/apiClient';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { clickTableRow } from '../commands/clickTableRow';
import { clickTableRowAction } from '../commands/clickTableRowAction';
import { deleteResourceFromDetailsPage } from '../commands/deleteResourceFromDetailsPage';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export const Team = {
  api: {
    delete: async (page: Page, teamId: number): Promise<void> => {
      await gatewayAPI.delete(page, `teams/${teamId}/`);
    },
  },
  ui: {
    create: async (
      page: Page,
      options: { teamName?: string; description?: string; organizationName: string }
    ): Promise<string> => {
      await navigateTo(page, 'Access Management', 'Teams');
      await page.getByText('Create team').click();
      await expect(page.getByRole('heading', { name: 'Create team' })).toBeVisible();

      const teamName = options.teamName ?? createE2EName('team');
      await page.getByLabel('Name').fill(teamName);

      if (options.description) {
        await page.getByLabel('Description').fill(options.description);
      }

      await singleSelectByLabel('Organization', options.organizationName, page);

      await page.getByRole('button', { name: 'Create team' }).click();
      await expect(page.getByRole('heading', { name: teamName })).toBeVisible();

      return teamName;
    },

    editFromList: async (page: Page, teamName: string, newTeamName: string): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Teams');
      await clickTableRowAction(
        {
          text: teamName,
          action: 'Edit team',
          filterLabel: 'Name',
          clearFilters: true,
        },
        page
      );

      await expect(
        page.getByRole('heading', { name: `Edit ${teamName}`, exact: true })
      ).toBeVisible();
      await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(newTeamName);
      await page.getByRole('button', { name: 'Save team', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Teams', exact: true })).toBeVisible();
    },

    edit: async (page: Page, teamName: string, newTeamName: string): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Teams');
      await clickTableRow({ filterLabel: 'Name', text: teamName }, page);
      await page.getByRole('tab', { name: 'Details', exact: true }).click();
      await page.getByRole('button', { name: 'Edit team', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: `Edit ${teamName}`, exact: true })
      ).toBeVisible();
      await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(newTeamName);
      await page.getByRole('button', { name: 'Save team', exact: true }).click();
      await expect(page.getByRole('heading', { name: newTeamName, exact: true })).toBeVisible();
    },

    delete: async (page: Page, teamName: string): Promise<void> => {
      await deleteResourceFromDetailsPage(
        {
          resourceName: teamName,
          resourceType: 'team',
          filterLabel: 'Name',
          navigationPath: ['Access Management', 'Teams'],
        },
        page
      );
    },
  },
} as const;
