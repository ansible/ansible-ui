import { expect } from '@playwright/test';
import { test } from '@ansible/playwright/fixtures/hub/collection.fixture';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { waitForVersionsInRepository } from '@ansible/playwright/commands/hub/collectionHelpers';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Collection Approvals', () => {
  test(
    'should be able to view import logs',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page, collection }) => {
      const namespaceName = await collection.createNamespace();

      await collection.uploadVersion({
        namespace: namespaceName,
        name: 'test_collection',
        version: '1.0.0',
        repository: 'staging',
      });

      await waitForVersionsInRepository(
        page,
        namespaceName,
        'test_collection',
        ['1.0.0'],
        'staging',
        30
      );

      await navigateTo(page, 'Automation Content', 'Collection Approvals');

      await clickTableRowAction(
        {
          filterLabel: 'Namespace',
          filterValue: namespaceName,
          text: namespaceName,
          action: 'View import logs',
          inKebab: true,
        },
        page
      );

      await expect(page.getByRole('heading', { name: 'My imports' })).toBeVisible();
      await expect(page).toHaveURL(/my-imports/);
      await expect(page).toHaveURL(new RegExp(namespaceName));
      await expect(page).toHaveURL(/test_collection/);
      await expect(page).toHaveURL(/1\.0\.0/);

      await expect(page.getByTestId('page-title')).toHaveText('My imports');
      await expect(page.getByTestId('namespace-selector')).toHaveText(namespaceName);
      await expect(page.getByTestId('import-log-content')).toBeVisible();
      await expect(page.getByTestId('import-console')).toBeVisible();
    }
  );

  test(
    'should be able to approve collection',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page, collection }) => {
      const namespaceName = await collection.createNamespace();

      await collection.uploadVersion({
        namespace: namespaceName,
        name: 'test_collection',
        version: '1.0.0',
        repository: 'staging',
      });

      await waitForVersionsInRepository(
        page,
        namespaceName,
        'test_collection',
        ['1.0.0'],
        'staging',
        30
      );

      await navigateTo(page, 'Automation Content', 'Collection Approvals');

      await clickTableRowAction(
        {
          filterLabel: 'Namespace',
          filterValue: namespaceName,
          text: namespaceName,
          action: 'Approve and sign collection',
          inKebab: false,
        },
        page
      );

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await dialog.getByRole('checkbox').click();
      await dialog.getByTestId('submit').click();
      await expect(dialog).not.toBeVisible();

      await navigateTo(page, 'Automation Content', 'Collections');

      await filterTable({ filterValue: namespaceName, filterLabel: 'Namespace' }, page);

      const collectionRow = await getTableRow(page, namespaceName);
      await expect(collectionRow).toContainText('published');
      await expect(collectionRow).toContainText('test_collection');
    }
  );

  test(
    'should be able to reject collection',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page, collection }) => {
      const namespaceName = await collection.createNamespace();

      await collection.uploadVersion({
        namespace: namespaceName,
        name: 'test_collection',
        version: '1.0.0',
        repository: 'staging',
      });

      await waitForVersionsInRepository(
        page,
        namespaceName,
        'test_collection',
        ['1.0.0'],
        'staging',
        30
      );

      await navigateTo(page, 'Automation Content', 'Collection Approvals');

      await clickTableRowAction(
        {
          filterLabel: 'Namespace',
          filterValue: namespaceName,
          text: namespaceName,
          action: 'Reject collection',
          inKebab: false,
        },
        page
      );

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await dialog.getByRole('checkbox').click();
      await dialog.getByTestId('submit').click();
      await expect(dialog).not.toBeVisible();

      await clearTableFilters(page);
      await expect(page.getByTestId('page-toolbar')).toBeVisible();
      await filterTable(
        {
          filterLabel: 'Namespace',
          filterValue: namespaceName,
        },
        page
      );

      const td = page.locator(`td >> text=${namespaceName}`);
      const collectionRow = page.locator('tr').filter({ has: td });
      await expect(collectionRow).toContainText('Rejected');
    }
  );
});
