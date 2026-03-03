import { Page, expect } from '@playwright/test';
import { gatewayAPI } from '../commands/apiClient';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { clickTableRow } from '../commands/clickTableRow';
import { clickTableRowAction } from '../commands/clickTableRowAction';
import { deleteResourceFromDetailsPage } from '../commands/deleteResourceFromDetailsPage';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';

export interface CreateTeamAPIOptions {
  name?: string;
  description?: string;
  organization: number;
}

export const Team = {
  api: {
    create: async (page: Page, options: CreateTeamAPIOptions): Promise<PlatformTeam> => {
      const team = await gatewayAPI.post<PlatformTeam>(page, 'teams/', {
        name: options.name ?? createE2EName('team'),
        description: options.description ?? 'Created via API for E2E testing',
        organization: options.organization,
      });

      if (!team) {
        throw new Error('Failed to create team: API returned null');
      }

      return team;
    },

    delete: async (page: Page, teamId: number): Promise<void> => {
      await gatewayAPI.delete(page, `teams/${teamId}/`);
    },

    deleteByName: async (page: Page, teamName: string): Promise<void> => {
      if (!teamName) return;
      const list = await gatewayAPI
        .get<{ results: Array<{ id: number }> }>(page, `teams/`, {
          params: { name: teamName },
        })
        .catch(() => null);
      const id = list?.results?.[0]?.id;
      if (!id) return;
      await gatewayAPI.delete(page, `teams/${id}/`).catch(() => {});
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
