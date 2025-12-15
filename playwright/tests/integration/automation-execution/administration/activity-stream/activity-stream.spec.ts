import { filterTableByText } from '@ansible/playwright/commands/filterTableByText';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableFilter } from '@ansible/playwright/commands/selectTableFilter';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Inventory, Organization } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.describe('Activity Stream - Navigation', () => {
  let organizationName: string;
  let inventoryName: string;

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page, { organizationName });
  });

  test.afterEach(async ({ page }) => {
    try {
      await Inventory.ui.delete(page, inventoryName);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Organization.ui.delete(page, organizationName);
    } catch {
      // Ignore cleanup errors
    }
    await setupAfter({ page });
  });

  test(
    'should navigate to resource detail page from activity stream list',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Administration', 'Activity Stream');
      await expect(
        page.getByRole('heading', { name: 'Activity Stream', exact: true })
      ).toBeVisible();

      // Filter by Search to find the inventory creation event
      await selectTableFilter('Search', page);
      await filterTableByText({ filterValue: inventoryName }, page);

      // Find the row with the inventory creation event
      const row = page.getByRole('row').filter({ hasText: `created inventory ${inventoryName}` });
      await expect(row).toBeVisible();

      // Click the source-resource-detail link in the row
      await row.getByTestId('source-resource-detail').click();

      // Verify navigation to inventory details page
      await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
    }
  );

  test(
    'should navigate to resource detail page from event details modal',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Administration', 'Activity Stream');
      await expect(
        page.getByRole('heading', { name: 'Activity Stream', exact: true })
      ).toBeVisible();

      // Filter by Search to find the inventory creation event
      await selectTableFilter('Search', page);
      await filterTableByText({ filterValue: inventoryName }, page);

      // Find the row and click the View event details button
      const row = page.getByRole('row').filter({ hasText: `created inventory ${inventoryName}` });
      await expect(row).toBeVisible();
      await row.getByRole('button', { name: 'View event details' }).click();

      // Verify modal is open
      const modal = page.getByTestId('activity-stream-event-modal');
      await expect(modal).toBeVisible();

      // Click the source-resource-detail link in the modal
      await modal.getByTestId('source-resource-detail').click();

      // Verify navigation to inventory details page
      await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
    }
  );
});
