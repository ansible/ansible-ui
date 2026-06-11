import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization, User, Team } from '@ansible/playwright/utils';

test.describe('Platform Teams - Users Tab', () => {
  let organizationName: string;
  let userName1: string;
  let userName2: string;
  let teamName: string;

  test.beforeEach(setupBefore({ path: '/access/teams' }));
  test.afterEach(async ({ page }) => {
    await User.ui.delete(page, userName1).catch(() => {});
    await User.ui.delete(page, userName2).catch(() => {});
    await Team.ui.delete(page, teamName).catch(() => {});
    await Organization.ui.delete(page, organizationName).catch(() => {});
  });
  test.afterEach(setupAfter);

  test(
    'can bulk assign and remove users to a team',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      organizationName = await Organization.ui.create(page);
      userName1 = await User.ui.create(page).then((r) => (typeof r === 'string' ? r : r.userName));
      userName2 = await User.ui.create(page).then((r) => (typeof r === 'string' ? r : r.userName));
      teamName = await Team.ui.create(page, { organizationName });

      // assert team > users table is empty
      await page.getByRole('tab', { name: 'Users', exact: true }).click();
      await expect(page.getByText('No users assigned to this team')).toBeVisible();

      // assign users using bulk action
      await page.getByRole('button', { name: 'Assign users', exact: true }).click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      await modal.getByRole('textbox', { name: 'Type to filter' }).fill(userName1);
      await modal.getByRole('button', { name: 'apply filter' }).click();
      await modal.getByRole('textbox', { name: 'Type to filter' }).fill(userName2);
      await modal.getByRole('button', { name: 'apply filter' }).click();
      const user1Row = modal.getByRole('row').filter({ hasText: userName1 });
      await user1Row.getByRole('checkbox').check();
      const user2Row = modal.getByRole('row').filter({ hasText: userName2 });
      await user2Row.getByRole('checkbox').check();
      await modal.getByRole('button', { name: 'Assign users', exact: true }).click();
      await expect(modal).toBeHidden();

      // assert team > users table has 2 rows
      await expect(page.locator('table tbody tr')).toHaveCount(2);

      // remove users using bulk action
      await page.getByRole('checkbox', { name: 'Select all rows' }).check();
      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await expect(page.getByRole('menuitem', { name: `Remove users` })).toBeVisible();
      await page.getByRole('menuitem', { name: `Remove users` }).click();
      await page.getByRole('checkbox', { name: /confirm/ }).check();

      const submitButton = page.getByRole('button', { name: 'Remove users' });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      await expect(page.getByRole('dialog')).toBeHidden();

      // assert team > users table is empty
      await expect(page.getByText('No users assigned to this team')).toBeVisible();
    }
  );
});
