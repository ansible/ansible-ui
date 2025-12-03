import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization } from '@ansible/playwright/utils';
import { User } from '../../../../utils/user';

test.describe('Organization User Roles', () => {
  let organizationName: string;
  let username: string;

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
    organizationName = await Organization.ui.create(page);
    username = await User.ui.create(page).then((r) => (typeof r === 'string' ? r : r.userName));
  });

  test.afterEach(async ({ page }) => {
    await User.ui.delete(page, username);
    await Organization.ui.delete(page, organizationName);
    await setupAfter({ page });
  });

  test(
    'should handle form submission with role changes',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      await page.getByRole('tab', { name: 'Users' }).click();

      // Add the user to the organization with initial roles
      await page.locator('a, button').filter({ hasText: 'Assign users' }).click();
      await selectTableRow(
        {
          pageTitle: 'Select user(s)',
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await selectTableRow(
        {
          pageTitle: 'Select organization roles',
          filterLabel: 'Name',
          filterValue: 'Organization Member',
        },
        page
      );
      await selectTableRow(
        {
          pageTitle: 'Select organization roles',
          filterLabel: 'Name',
          filterValue: 'Organization Approval',
          clearFilters: true,
        },
        page
      );
      await page.getByRole('button', { name: 'Next', exact: true }).click();
      await page.getByRole('button', { name: 'Finish' }).click();

      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();

      // manage/edit the roles and confirm changes take place
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );
      await page.getByRole('link', { name: 'Manage organization roles' }).click();

      // Wait for the manage roles page to load
      await expect(
        page.getByRole('heading', {
          name: `Manage organization roles directly assigned to ${username}`,
        })
      ).toBeVisible();

      // deselect org approval role
      await selectTableRow(
        {
          filterLabel: 'Name',
          filterValue: 'Organization Approval',
        },
        page
      );
      // select org admin role
      await selectTableRow(
        {
          filterLabel: 'Name',
          filterValue: 'Organization Admin',
          clearFilters: true,
        },
        page
      );

      const saveButton = page.getByRole('button', { name: 'Save roles' });
      await expect(saveButton).not.toBeDisabled();
      await saveButton.click();

      // confirm assigned roles show in roles tab
      await clickTableRow(
        {
          text: username,
          pageTitle: organizationName,
          filterLabel: 'Username',
          filterValue: username,
        },
        page
      );
      await expect(page.getByRole('heading', { name: username })).toBeVisible();
      await page.getByRole('tab', { name: 'Roles' }).click();
      await expect(page.locator('table tbody tr')).toHaveCount(2);

      await expect(page.getByRole('gridcell', { name: 'Organization Member' })).toBeVisible();
      await expect(
        page.getByRole('gridcell', {
          name: 'Organization Admin',
        })
      ).toBeVisible();
    }
  );
});
