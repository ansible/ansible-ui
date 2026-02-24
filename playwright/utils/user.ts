import { Page, expect } from '@playwright/test';
import { gatewayAPI } from '../commands/apiClient';
import { createE2EName, createE2EUsername } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { clickTableRow } from '../commands/clickTableRow';
import { clickTableRowAction } from '../commands/clickTableRowAction';
import { deleteResourceFromDetailsPage } from '../commands/deleteResourceFromDetailsPage';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';

export interface CreateUserAPIOptions {
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface CreateUserUIOptions {
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  userType?: 'normal' | 'system-admin' | 'platform-auditor';
  organizationName?: string;
}

export const User = {
  api: {
    create: async (page: Page, options: CreateUserAPIOptions = {}): Promise<PlatformUser> => {
      const username = options.username ?? createE2EUsername('user').toLowerCase();
      const password = options.password ?? 'pw';

      // Build payload with only defined fields
      const payload: Record<string, string> = {
        username,
        password,
      };

      if (options.first_name) payload.first_name = options.first_name;
      if (options.last_name) payload.last_name = options.last_name;
      if (options.email) payload.email = options.email;

      const user = await gatewayAPI.post<PlatformUser>(page, 'users/', payload);

      if (!user) {
        throw new Error('Failed to create user: API returned null');
      }

      return user;
    },

    delete: async (page: Page, userId: number): Promise<void> => {
      await gatewayAPI.delete(page, `users/${userId}/`);
    },

    deleteByName: async (page: Page, userName: string): Promise<void> => {
      if (!userName) return;
      const list = await gatewayAPI
        .get<{ results: Array<{ id: number }> }>(page, `users/`, {
          params: { username: userName },
        })
        .catch(() => null);
      const id = list?.results?.[0]?.id;
      if (!id) return;
      await gatewayAPI.delete(page, `users/${id}/`).catch(() => {});
    },
  },

  ui: {
    create: async (
      page: Page,
      options: CreateUserUIOptions = {}
    ): Promise<{
      userName: string;
      password: string;
      firstName: string;
      lastName: string;
      email: string;
    }> => {
      await navigateTo(page, 'Access Management', 'Users');
      await expect(page.getByRole('link', { name: 'Create user', exact: true })).toBeVisible();
      await page.getByRole('link', { name: 'Create user', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Create user', exact: true })).toBeVisible();

      const userName = options.userName ?? createE2EName('user', { noWhitespace: true });
      const password = options.password ?? 'password';
      const firstName =
        options.firstName ?? `FirstName${Math.random().toString(36).substring(2, 4)}`;
      const lastName = options.lastName ?? `LastName${Math.random().toString(36).substring(2, 4)}`;
      const email = options.email ?? `user${Math.random().toString(36).substring(2, 5)}@email.com`;

      await page.getByRole('textbox', { name: 'Username', exact: true }).fill(userName);
      await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
      await page.getByRole('textbox', { name: 'Confirm password', exact: true }).fill(password);

      const userType = options.userType;
      if (userType && userType !== 'normal') {
        await page.getByRole('button', { name: 'Normal user' }).click();
        if (userType === 'system-admin') {
          await page
            .getByRole('option', { name: 'Ansible Automation Platform administrator' })
            .click();
        } else if (userType === 'platform-auditor') {
          await page.getByRole('option', { name: 'Ansible Automation Platform auditor' }).click();
        }
      }

      await page.getByRole('textbox', { name: 'First name', exact: true }).fill(firstName);
      await page.getByRole('textbox', { name: 'Last name', exact: true }).fill(lastName);
      await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);

      await page.getByRole('button', { name: 'Create user', exact: true }).click();
      await expect(page.getByRole('heading', { name: userName, exact: true })).toBeVisible();

      return { userName, password, firstName, lastName, email };
    },

    edit: async (page: Page, userName: string, newUserName: string): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRowAction(
        {
          text: userName,
          action: 'Edit user',
          filterLabel: 'Username',
          clearFilters: true,
        },
        page
      );

      await expect(
        page.getByRole('heading', { name: `Edit ${userName}`, exact: true })
      ).toBeVisible();
      await page.getByRole('textbox', { name: 'Username', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Username', exact: true }).fill(newUserName);
      await page.getByRole('button', { name: 'Save user', exact: true }).click();
      await expect(page.getByRole('heading', { name: newUserName, exact: true })).toBeVisible();
    },

    editFromDetails: async (page: Page, userName: string, newUserName: string): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: userName }, page);
      await page.getByRole('tab', { name: 'Details', exact: true }).click();
      await page.getByRole('button', { name: 'Edit user', exact: true }).click();

      await expect(
        page.getByRole('heading', { name: `Edit ${userName}`, exact: true })
      ).toBeVisible();
      await page.getByRole('textbox', { name: 'Username', exact: true }).clear();
      await page.getByRole('textbox', { name: 'Username', exact: true }).fill(newUserName);
      await page.getByRole('button', { name: 'Save user', exact: true }).click();
      await expect(page.getByRole('heading', { name: newUserName, exact: true })).toBeVisible();
    },

    delete: async (page: Page, userName: string): Promise<void> => {
      await deleteResourceFromDetailsPage(
        {
          resourceName: userName,
          resourceType: 'user',
          filterLabel: 'Username',
          navigationPath: ['Access Management', 'Users'],
        },
        page
      );
    },

    assignTeam: async (page: Page, userName: string, teamName: string): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: userName }, page);
      await page.getByRole('tab', { name: 'Teams', exact: true }).click();

      await page.getByRole('button', { name: 'Assign teams', exact: true }).click();

      await page.getByRole('textbox', { name: 'Type to filter' }).fill(teamName);
      await page.getByRole('button', { name: 'apply filter' }).click();

      await page.getByRole('checkbox', { name: 'Select row' }).first().click();

      await page.getByRole('button', { name: 'Assign teams', exact: true }).last().click();

      await expect(page.locator('dialog')).not.toBeVisible();

      await page.waitForSelector('tbody', { timeout: 10000 });
      await expect(page.locator('tbody')).toContainText(teamName);
    },

    removeTeam: async (page: Page, _userName: string, _teamName: string): Promise<void> => {
      await page.getByRole('checkbox', { name: 'Select row' }).first().click();

      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await page.getByRole('menuitem', { name: 'Remove teams' }).click();

      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).click();
      await page.getByRole('button', { name: 'Remove teams', exact: true }).click();

      await expect(
        page.getByTestId(/row-id-\d+/).getByText('Success', { exact: true })
      ).toBeVisible();
    },
  },
} as const;
