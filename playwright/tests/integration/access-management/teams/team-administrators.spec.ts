import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Team, User, Organization } from '@ansible/playwright/utils';

test.describe('Platform Teams - Administrators Tab', () => {
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

  test('can add and remove administrators to a team', { tag: ['@not_mock'] }, async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    userName1 = await User.ui.create(page).then((r) => (typeof r === 'string' ? r : r.userName));
    userName2 = await User.ui.create(page).then((r) => (typeof r === 'string' ? r : r.userName));
    teamName = await Team.ui.create(page, { organizationName });

    // assert team > administrators table is empty
    await page.getByRole('tab', { name: 'Administrators', exact: true }).click();
    await expect(
      page.getByText('There are currently no administrators added to this team')
    ).toBeVisible();

    // add administrators using bulk action
    await page.getByText('Add administrators', { exact: true }).click();

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
    await modal.getByRole('button', { name: 'Add administrators', exact: true }).click();
    await expect(modal).toBeHidden();

    // assert team > administrators table has 2 rows
    await expect(page.locator('table tbody tr')).toHaveCount(2);

    // remove administrators using bulk action
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'toolbar actions' }).click();
    await expect(page.getByRole('menuitem', { name: `Remove administrators` })).toBeVisible();
    await page.getByRole('menuitem', { name: `Remove administrators` }).click();
    await page.getByRole('checkbox', { name: /confirm/ }).check();

    const submitButton = page.getByRole('button', { name: 'Remove administrators' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(page.getByRole('dialog')).toBeHidden();

    // assert team > administrators table is empty
    await expect(
      page.getByText('There are currently no administrators added to this team')
    ).toBeVisible();
  });
});
