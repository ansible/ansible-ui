import { expect } from '@playwright/test';
import { Page } from 'playwright-core';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { clickTableRowAction } from '../../../../commands/clickTableRowAction';
import { createE2EName } from '../../../../commands/createE2EName';
import { deleteResourceFromDetailsPage } from '../../../../commands/deleteResourceFromDetailsPage';
import { navigateTo } from '../../../../commands/navigateTo';

export interface CreateUserOptions {
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  userType?: 'normal' | 'system-admin' | 'platform-auditor';
  organizationName?: string;
}

// Overloaded function signatures for backward compatibility
export async function createUser(
  options: { userName?: string; organizationName?: string },
  page: Page
): Promise<string>;
export async function createUser(
  options: CreateUserOptions,
  page: Page
): Promise<{
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
}>;
export async function createUser(
  options: CreateUserOptions | { userName?: string; organizationName?: string },
  page: Page
): Promise<
  | string
  | { userName: string; password: string; firstName: string; lastName: string; email: string }
> {
  await navigateTo(page, 'Access Management', 'Users');
  await expect(page.getByRole('link', { name: 'Create user', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Create user', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create user', exact: true })).toBeVisible();

  const userName = options.userName ?? createE2EName('user', { noWhitespace: true });
  const password = (options as CreateUserOptions).password ?? 'password';
  const firstName =
    (options as CreateUserOptions).firstName ??
    `FirstName${Math.random().toString(36).substring(2, 4)}`;
  const lastName =
    (options as CreateUserOptions).lastName ??
    `LastName${Math.random().toString(36).substring(2, 4)}`;
  const email =
    (options as CreateUserOptions).email ??
    `user${Math.random().toString(36).substring(2, 5)}@email.com`;

  await page.getByRole('textbox', { name: 'Username', exact: true }).fill(userName);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
  await page.getByRole('textbox', { name: 'Confirm password', exact: true }).fill(password);

  // Handle user type selection
  const userType = (options as CreateUserOptions).userType;
  if (userType && userType !== 'normal') {
    // Click the user type dropdown button (currently shows "Normal user")
    await page.getByRole('button', { name: 'Normal user' }).click();
    if (userType === 'system-admin') {
      await page.getByRole('option', { name: 'Ansible Automation Platform administrator' }).click();
    } else if (userType === 'platform-auditor') {
      await page.getByRole('option', { name: 'Ansible Automation Platform auditor' }).click();
    }
  }

  await page.getByRole('textbox', { name: 'First name', exact: true }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last name', exact: true }).fill(lastName);
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(email);

  await page.getByRole('button', { name: 'Create user', exact: true }).click();
  await expect(page.getByRole('heading', { name: userName, exact: true })).toBeVisible();

  // Return appropriate type based on input
  if (
    'userType' in options ||
    'firstName' in options ||
    'lastName' in options ||
    'email' in options ||
    'password' in options
  ) {
    return { userName, password, firstName, lastName, email };
  } else {
    return userName;
  }
}

export async function editUser(userName: string, newUserName: string, page: Page) {
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

  await expect(page.getByRole('heading', { name: `Edit ${userName}`, exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Username', exact: true }).clear();
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill(newUserName);
  await page.getByRole('button', { name: 'Save user', exact: true }).click();
  await expect(page.getByRole('heading', { name: newUserName, exact: true })).toBeVisible();
}

export async function editUserFromDetailsPage(userName: string, newUserName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Users');
  await clickTableRow({ filterLabel: 'Username', text: userName }, page);
  await page.getByRole('tab', { name: 'Details', exact: true }).click();
  await page.getByRole('button', { name: 'Edit user', exact: true }).click();

  await expect(page.getByRole('heading', { name: `Edit ${userName}`, exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Username', exact: true }).clear();
  await page.getByRole('textbox', { name: 'Username', exact: true }).fill(newUserName);
  await page.getByRole('button', { name: 'Save user', exact: true }).click();
  await expect(page.getByRole('heading', { name: newUserName, exact: true })).toBeVisible();
}

export async function deleteUser(userName: string, page: Page) {
  await deleteResourceFromDetailsPage(
    {
      resourceName: userName,
      resourceType: 'user',
      filterLabel: 'Username',
      navigationPath: ['Access Management', 'Users'],
    },
    page
  );
}

export async function assignTeamToUser(userName: string, teamName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Users');
  await clickTableRow({ filterLabel: 'Username', text: userName }, page);
  await page.getByRole('tab', { name: 'Teams', exact: true }).click();

  await page.getByRole('button', { name: 'Assign teams', exact: true }).click();

  // In modal, filter for the specific team
  await page.getByRole('textbox', { name: 'Type to filter' }).fill(teamName);
  await page.getByRole('button', { name: 'apply filter' }).click();

  // Select the team
  await page.getByRole('checkbox', { name: 'Select row' }).first().click();

  // Click the assign button in the modal footer
  await page.getByRole('button', { name: 'Assign teams', exact: true }).last().click();

  // Wait for modal to close and verify team is assigned
  await expect(page.locator('dialog')).not.toBeVisible();

  // Wait for the teams table to load and verify team is assigned
  await page.waitForSelector('tbody', { timeout: 10000 });
  await expect(page.locator('tbody')).toContainText(teamName);
}

export async function removeTeamFromUser(userName: string, teamName: string, page: Page) {
  // Assume we're already on the user's teams tab (called after assignTeamToUser)
  // Select the team checkbox (no need to filter if only one team)
  await page.getByRole('checkbox', { name: 'Select row' }).first().click();

  // Click toolbar actions dropdown
  await page.getByRole('button', { name: 'toolbar actions' }).click();
  await page.getByRole('menuitem', { name: 'Remove teams' }).click();

  // Confirm removal in the modal
  await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).click();
  await page.getByRole('button', { name: 'Remove teams', exact: true }).click();

  // Verify success - target the specific table row to avoid strict mode violation
  await expect(page.getByTestId(/row-id-\d+/).getByText('Success', { exact: true })).toBeVisible();
}
