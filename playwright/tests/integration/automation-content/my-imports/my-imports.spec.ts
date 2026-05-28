import { expect, test } from '@ansible/playwright/fixtures/hub/collection.fixture';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { selectTableFilter } from '@ansible/playwright/commands/selectTableFilter';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - My Imports', () => {
  test(
    'should render empty states',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page, collection }) => {
      const namespaceName = await collection.createNamespace();
      const collectionName = `testcollection_${Date.now()}`.toLowerCase();
      const collectionVersion = '1.0.0';

      await collection.uploadVersion({
        namespace: namespaceName,
        name: collectionName,
        version: collectionVersion,
        repository: 'staging',
      });

      await test.step('Navigate to My Imports via namespace actions', async () => {
        await navigateTo(page, 'Automation Content', 'Namespaces');
        await expect(page.getByRole('heading', { name: 'Namespaces' })).toBeVisible();

        await clickTableRowAction(
          {
            text: namespaceName,
            action: 'Imports',
          },
          page
        );

        await expect(page.getByRole('heading', { name: 'My Imports' })).toBeVisible();
        await expect(page.locator('#namespace-selector')).toContainText(namespaceName);
      });

      await test.step('Reset and verify empty states', async () => {
        await page.getByTestId('reset').click();

        await expect(page.getByText('No namespace selected.')).toBeVisible();
        await expect(page.getByText('No data')).toBeVisible();
        await expect(page.locator('#namespace-selector')).toContainText('Select namespace');
        await expect(page.locator('.pf-v6-c-label-group')).not.toBeVisible();
      });
    }
  );

  test(
    'should display import details, browse namespaces, and filter imports',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page, collection }) => {
      const namespaceName = await collection.createNamespace();
      const collectionName = `testcollection_${Date.now()}`.toLowerCase();
      const collectionVersion = '1.0.0';

      await collection.uploadVersion({
        namespace: namespaceName,
        name: collectionName,
        version: collectionVersion,
        repository: 'staging',
      });

      await test.step('Navigate to My Imports via namespace actions', async () => {
        await navigateTo(page, 'Automation Content', 'Namespaces');
        await expect(page.getByRole('heading', { name: 'Namespaces' })).toBeVisible();

        await clickTableRowAction(
          {
            text: namespaceName,
            action: 'Imports',
          },
          page
        );

        await expect(page.getByRole('heading', { name: 'My Imports' })).toBeVisible();
        await expect(page.locator('#namespace-selector')).toContainText(namespaceName);
      });

      await test.step('Verify import row displays correct information', async () => {
        const importRow = page.getByTestId(`row-id-${collectionName}`);
        await expect(importRow).toBeVisible();
        await expect(importRow.locator('h4')).toContainText(
          `${collectionName} v${collectionVersion}`
        );
        await expect(importRow).toContainText(/completed/i);

        // Click on the import row to ensure it's selected and triggers message load
        await importRow.click();
      });

      await test.step('Verify import log content', async () => {
        const importLogContent = page.getByTestId('import-log-content');
        await expect(importLogContent).toBeVisible();
        await expect(importLogContent.locator('h3')).toContainText(
          `${namespaceName}.${collectionName}`
        );
        await expect(importLogContent).toContainText('Completed');
        await expect(importLogContent).toContainText(collectionVersion);
        await expect(importLogContent).toContainText('waiting for approval');

        // Verify import console is present (messages may vary based on upload method)
        const importConsole = page.getByTestId('import-console');
        await expect(importConsole).toBeVisible();
      });

      await test.step('Test namespace browser modal', async () => {
        await page.locator('#namespace-selector').click();
        await page.locator('.pf-v6-c-menu__footer').getByText('Browse').click();

        const modal = page.locator('[data-ouia-component-type="PF6/ModalContent"]');
        await expect(modal).toBeVisible();

        await modal.getByRole('row', { name: namespaceName }).locator('td').first().click();
        await page.getByRole('button', { name: 'Confirm' }).click();

        await expect(page.locator('#namespace-selector')).toContainText(namespaceName);
      });

      await test.step('Apply filters by name, version, and status', async () => {
        // Filter by Name (debounced text input)
        await filterTable({ filterLabel: 'Name', filterValue: collectionName }, page);

        // Filter by Version (debounced text input - no apply button)
        await selectTableFilter('Version', page);
        await page.locator('#filter-input').locator('input').fill(collectionVersion);
        await page.waitForTimeout(500); // Wait for debounce

        // Filter by Status (select dropdown)
        await selectTableFilter('Status', page);
        await page.click('#filter-input');
        await page.getByRole('option', { name: 'Completed' }).click();

        // Verify filter chips are displayed
        await expect(page.getByRole('list', { name: 'Name' })).toContainText(collectionName);
        await expect(page.getByRole('list', { name: 'Version' })).toContainText(collectionVersion);
        await expect(page.getByRole('list', { name: 'Status' })).toContainText('Completed');
        await expect(page).toHaveURL(new RegExp(namespaceName));
        await expect(page).toHaveURL(new RegExp(collectionName));

        // Verify filtered results
        const filteredRow = page.getByTestId(`row-id-${collectionName}`);
        await expect(filteredRow.locator('h4')).toContainText(
          `${collectionName} v${collectionVersion}`
        );
        await expect(filteredRow).toContainText(/completed/i);
      });

      await test.step('Clear filters and verify reset', async () => {
        await clearTableFilters(page);

        // Verify filter chips are removed
        await expect(page.getByRole('list', { name: 'Name' })).not.toBeVisible();
        await expect(page.getByRole('list', { name: 'Version' })).not.toBeVisible();
        await expect(page.getByRole('list', { name: 'Status' })).not.toBeVisible();
      });
    }
  );
});
