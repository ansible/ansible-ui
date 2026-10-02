import {
  AAP_DEV_LOCALHOST_URL,
  TOPOLOGY_AZURE,
  TOPOLOGY_OCP_A,
  TOPOLOGY_SAAS,
} from '@ansible/playwright/commands/constants';
import { isOcpA, isTopology } from '@ansible/playwright/commands/getTopologyType';
import { filterTableByText } from '@ansible/playwright/commands/filterTableByText';
import { platformUI } from '@ansible/playwright/commands/login';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { test } from '@ansible/playwright/fixtures/hub/collection.fixture';
import { expect } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/content/collections' }));
test.afterEach(setupAfter);

test.describe('Hub Collections - List View', () => {
  test.describe('Sign Operations', () => {
    test(
      'should sign collection from list view',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page, collection }) => {
        test.setTimeout(180000);

        if (
          isTopology(TOPOLOGY_SAAS, TOPOLOGY_AZURE, TOPOLOGY_OCP_A) ||
          platformUI.includes(AAP_DEV_LOCALHOST_URL)
        ) {
          test.skip();
          return;
        }

        const namespace = 'e2esignlist';
        const name = 'signlistview';

        await collection.createNamespace({ name: namespace });
        const uploaded = await collection.uploadVersion({
          namespace,
          name,
          version: '1.0.0',
          repository: 'staging',
        });

        await collection.approveCollection({
          namespace: uploaded.namespace,
          name: uploaded.name,
          version: uploaded.version,
          destinationRepository: 'validated',
        });

        // Navigate to collections list
        await page.goto(`${platformUI}/content/collections`);

        // Switch to list view
        await page.getByTestId('list-view').click();

        // Filter by collection name
        await filterTableByText({ filterValue: name }, page);

        // Wait for collection to appear in list
        await expect(page.getByTestId('data-list-name')).toContainText(name);

        // Open kebab menu from list view
        const dataListAction = page.getByTestId('data-list-action');
        await dataListAction.getByTestId('actions-dropdown').click();

        // Skip if signing is not available in this environment
        const signAction = page.getByTestId('sign-collection');
        if (!(await signAction.isVisible({ timeout: 3000 }).catch(() => false))) {
          test.skip(true, 'Signing not available in this environment');
          return;
        }

        // Click sign collection
        await signAction.click();

        // Confirm in modal
        const modal = page.getByRole('dialog');
        await modal.waitFor({ state: 'visible' });
        await modal.getByTestId('confirm').click();
        await modal.getByTestId('submit').click();

        // Wait for modal to close (indicates success)
        await expect(modal).toBeHidden({ timeout: 60000 });

        // Reload and verify signed status
        await page.reload();
        await page.getByTestId('list-view').click();
        await filterTableByText({ filterValue: name }, page);

        // Verify signed status is shown
        await expect(page.getByTestId('signed-status')).toContainText('Signed', { timeout: 30000 });
      }
    );
  });

  test.describe('Copy Operations', () => {
    test(
      'should copy version to repository from list view',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page, collection }) => {
        test.setTimeout(180000);

        if (isOcpA() || platformUI.includes(AAP_DEV_LOCALHOST_URL)) {
          test.skip();
          return;
        }

        const namespace = 'e2ecopylist';
        const name = 'copylistview';

        await collection.createNamespace({ name: namespace });
        const uploaded = await collection.uploadVersion({
          namespace,
          name,
          version: '1.0.0',
          repository: 'staging',
        });

        await collection.approveCollection({
          namespace: uploaded.namespace,
          name: uploaded.name,
          version: uploaded.version,
          destinationRepository: 'validated',
        });

        // Navigate to collections list
        await page.goto(`${platformUI}/content/collections`);

        // Stay in default list view (data list) - use first() since multiple items may exist
        await expect(page.getByTestId('data-list-name').first()).toBeVisible({ timeout: 15000 });

        // Filter by collection name
        await filterTableByText({ filterValue: name }, page);

        // Wait for collection to appear
        await expect(page.getByTestId('data-list-name')).toContainText(name);

        // Open kebab menu from list view
        const dataListAction = page.getByTestId('data-list-action');
        await dataListAction.getByTestId('actions-dropdown').click();

        // Click copy version to repositories
        await page.getByTestId('copy-version-to-repositories').click();

        // Wait for modal to appear
        const modal = page.getByRole('dialog');
        await modal.waitFor({ state: 'visible' });

        // Wait for the modal content to load
        await expect(modal.getByText('Select repositories')).toBeVisible({ timeout: 10000 });

        // Wait for table to load in modal
        const tableContainer = modal.getByTestId('hub-copy-to-repository-table');
        await tableContainer.waitFor({ state: 'visible', timeout: 30000 });

        // Wait for loading to complete
        const skeleton = tableContainer.locator('.pf-v6-c-skeleton');
        await expect(skeleton).toHaveCount(0, { timeout: 30000 });

        // Clear any existing filters in the modal that might have been inherited
        const clearAllFilters = modal.getByRole('button', { name: 'Clear all filters' });
        if (await clearAllFilters.isVisible({ timeout: 2000 }).catch(() => false)) {
          await clearAllFilters.click();
          // Wait for table to reload after clearing filters
          await page.waitForTimeout(1000);
          await expect(skeleton).toHaveCount(0, { timeout: 30000 });
        }

        // Find and select a repository checkbox (skip header checkbox)
        const rowCheckboxes = tableContainer.locator('tbody input[type="checkbox"]');
        const checkboxCount = await rowCheckboxes.count();

        if (checkboxCount === 0) {
          // No repositories available to copy to, cancel and verify page is intact
          await modal.getByRole('button', { name: 'Cancel' }).click();
          await modal.waitFor({ state: 'hidden' });
          await expect(page.getByTestId('data-list-name')).toContainText(name);
          return;
        }

        // Select first available unchecked checkbox
        for (let i = 0; i < checkboxCount; i++) {
          const checkbox = rowCheckboxes.nth(i);
          if (!(await checkbox.isChecked())) {
            await checkbox.click();
            break;
          }
        }

        // Click Select button
        const selectButton = modal.getByRole('button', { name: 'Select' });
        await expect(selectButton).toBeEnabled();
        await selectButton.click();

        // Wait for modal to close (indicates success)
        await expect(modal).toBeHidden({ timeout: 30000 });
      }
    );

    test(
      'should delete collection from repository in table view',
      { tag: ['@not_mock', '@tier1'] },
      async ({ page, collection }) => {
        test.setTimeout(180000);

        const namespace = 'e2edelrepo';
        const name = 'delrepolist';

        await collection.createNamespace({ name: namespace });
        const uploaded = await collection.uploadVersion({
          namespace,
          name,
          version: '1.0.0',
          repository: 'staging',
        });

        await collection.approveCollection({
          namespace: uploaded.namespace,
          name: uploaded.name,
          version: uploaded.version,
          destinationRepository: 'validated',
        });

        // Navigate to collections list
        await page.goto(`${platformUI}/content/collections`);

        // Switch to table view
        await page.getByTestId('table-view').click();

        // Filter by collection name
        await filterTableByText({ filterValue: name }, page);

        // Wait for table to load
        await page.locator('tbody').waitFor({ state: 'visible', timeout: 15000 });

        // Find the row with our collection
        const row = page.getByRole('row').filter({ hasText: name });
        await row.waitFor({ state: 'visible', timeout: 15000 });

        // Open kebab menu for this row
        await row.getByTestId('actions-dropdown').click();

        // Click delete entire collection from repository
        await page.getByTestId('delete-entire-collection-from-repository').click();

        // Confirm in modal
        const modal = page.getByRole('dialog');
        await modal.waitFor({ state: 'visible' });
        await modal.getByTestId('confirm').click();
        await modal.getByTestId('submit').click();

        // Wait for close button and click it
        const closeButton = modal.getByRole('button', { name: 'Close' });
        await closeButton.waitFor({ state: 'visible', timeout: 30000 });
        await closeButton.click();

        // Verify modal is closed
        await expect(modal).toBeHidden({ timeout: 10000 });
      }
    );
  });
});
