import { Page, expect } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';

export async function createOrganization(page: Page, options: { organizationName?: string } = {}) {
  await navigateTo(page, 'Access Management', 'Organizations');
  await page.getByText('Create organization', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Create organization' })).toBeVisible();
  const organizationName = options.organizationName ?? createE2EName();
  await page.getByLabel('Name').fill(organizationName);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  return organizationName;
}

export async function addUserToOrganization(
  organizationName: string,
  username: string,
  options: {
    roles?: string[];
    navigateToOrganization?: boolean;
  } = {},
  page: Page
) {
  const { roles = ['Organization Member'], navigateToOrganization = true } = options;

  // Navigate to organization if needed
  if (navigateToOrganization) {
    await navigateTo(page, 'Access Management', 'Organizations');
    await clickTableRow({ text: organizationName }, page);
  }

  // Go to Users tab and assign user
  await page.getByRole('tab', { name: 'Users' }).click();
  await page.locator('a, button').filter({ hasText: 'Assign users' }).click();

  // Select the user
  await selectTableRow(
    {
      pageTitle: 'Select user(s)',
      filterLabel: 'Username',
      filterValue: username,
    },
    page
  );
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // Select organization roles
  for (let i = 0; i < roles.length; i++) {
    await selectTableRow(
      {
        pageTitle: 'Select organization roles',
        filterLabel: 'Name',
        filterValue: roles[i],
        clearFilters: i > 0, // Only clear filters after the first role
      },
      page
    );
  }
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  // Wait for completion - ensure we're back on the Users tab and assignment is complete
  await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

  // Wait a moment for the assignment to be processed
  await page.waitForTimeout(1000);

  // Verify the user appears in the organization users list
  await expect(page.locator('tbody')).toContainText(username);
}

export async function deleteOrganization(organizationName: string, page: Page) {
  await navigateTo(page, 'Access Management', 'Organizations');
  await clickTableRow({ text: organizationName }, page);
  await clickPageAction('Delete organization', page);
  await confirmAndAssertDeletion(page);
}
