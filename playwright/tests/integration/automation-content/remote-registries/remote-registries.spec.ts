import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { RemoteRegistry } from '@ansible/playwright/utils';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Remote Registries', () => {
  test(
    'should explore different views and pagination',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const remoteRegistryName = createE2EName('remote-registry');
      const remoteRegistry = await RemoteRegistry.api.create(page, { name: remoteRegistryName });

      try {
        await navigateTo(page, 'Automation Content', 'Remote Registries');
        await expect(page.getByTestId('page-title')).toHaveText('Remote Registries');

        // Filter by remote registry name
        await page.getByPlaceholder('contains').fill(remoteRegistry.name);

        // Test card view
        await page.getByTestId('card-view').click();
        await expect(
          page.locator(`a[href*="/details"]:has-text("${remoteRegistry.name}")`)
        ).toBeVisible();

        // Test list view
        await page.getByTestId('list-view').click();
        await expect(
          page.locator(`a[href*="/details"]:has-text("${remoteRegistry.name}")`)
        ).toBeVisible();

        // Test table view
        await page.getByTestId('table-view').click();
        await expect(
          page.locator(`a[href*="/details"]:has-text("${remoteRegistry.name}")`)
        ).toBeVisible();

        // Select all and delete
        await page.getByRole('checkbox', { name: 'Select all' }).check();

        // Click toolbar kebab menu
        const toolbar = page.locator('[data-ouia-component-id="page-toolbar"]');
        await toolbar.getByTestId('actions-dropdown').click();
        await page.getByTestId('delete-remote-registries').click();

        // Confirm deletion
        await page.locator('#confirm').check();
        await page.getByRole('button', { name: 'Delete remote registries', exact: true }).click();

        // Wait for deletion to complete
        await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 30000 });

        // Clear filters
        await page
          .locator('[data-ouia-component-id="page-toolbar"]')
          .getByRole('button', { name: 'Clear all filters', exact: true })
          .click();
      } catch (error) {
        // Cleanup in case of failure
        try {
          await RemoteRegistry.api.delete(page, remoteRegistry.id);
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  );

  test('should sync remote registries', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    const remoteRegistryName = createE2EName('remote-registry');
    const remoteRegistry = await RemoteRegistry.api.create(page, { name: remoteRegistryName });

    try {
      await navigateTo(page, 'Automation Content', 'Remote Registries');
      await expect(page.getByTestId('page-title')).toHaveText('Remote Registries');

      // Filter by remote registry name
      await page.getByPlaceholder('contains').fill(remoteRegistry.name);

      // Check initial sync status
      const syncStatusCell = page.getByTestId('sync-status-column-cell').first();
      await expect(syncStatusCell).toContainText('Never synced');

      // Click sync action in kebab menu
      const row = await getTableRow(page, remoteRegistryName);
      await row.getByTestId('actions-column-cell').click();
      await page.getByTestId('sync-remote-registry').click();

      // Wait a bit for sync to start
      await page.waitForTimeout(1000);

      // Verify sync status changed
      await expect(syncStatusCell).toContainText(/Completed|Running/);
    } finally {
      await RemoteRegistry.api.delete(page, remoteRegistry.id);
    }
  });

  test(
    'should index execution environments',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const remoteRegistryName = createE2EName('remote-registry');
      const remoteRegistry = await RemoteRegistry.api.create(page, {
        name: remoteRegistryName,
        url: 'https://registry.redhat.io',
      });

      try {
        await navigateTo(page, 'Automation Content', 'Remote Registries');
        await expect(page.getByTestId('page-title')).toHaveText('Remote Registries');

        // Filter by remote registry name
        await page.getByPlaceholder('contains').fill(remoteRegistry.name);

        // Set up intercept for index API call
        const indexResponsePromise = page.waitForResponse(
          (response) =>
            response
              .url()
              .includes(`/_ui/v1/execution-environments/registries/${remoteRegistry.id}/index/`) &&
            response.request().method() === 'POST'
        );

        // Click index action in kebab menu
        const row = await getTableRow(page, remoteRegistryName);
        await row.getByTestId('actions-column-cell').click();
        await page.getByTestId('index-execution-environments').click();

        // Wait for index API call to confirm indexing started (202 Accepted)
        const indexResponse = await indexResponsePromise;
        expect(indexResponse.ok()).toBeTruthy();

        // Delete the remote registry
        await page.getByPlaceholder('contains').clear();
        await page.getByPlaceholder('contains').fill(remoteRegistry.name);

        const deleteRow = await getTableRow(page, remoteRegistryName);
        await deleteRow.getByTestId('actions-column-cell').click();
        await page.getByTestId('delete-remote-registry').click();

        await page.locator('#confirm').check();
        await page.getByRole('button', { name: 'Delete remote registries', exact: true }).click();

        // Clear filters
        await page
          .locator('[data-ouia-component-id="page-toolbar"]')
          .getByRole('button', { name: 'Clear all filters', exact: true })
          .click();
      } catch (error) {
        // Cleanup in case of failure
        try {
          await RemoteRegistry.api.delete(page, remoteRegistry.id);
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    }
  );

  test(
    'should create, search and delete a remote registry',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      const remoteRegistryName = createE2EName('remote-registry');

      // Set up API intercept
      const listResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/_ui/v1/execution-environments/registries/') &&
          response.request().method() === 'GET' &&
          response.status() === 200
      );

      await navigateTo(page, 'Automation Content', 'Remote Registries');
      await expect(page.getByTestId('page-title')).toHaveText('Remote Registries');

      const listResponse = await listResponsePromise;
      const responseData = (await listResponse.json()) as { data: { length: number } };

      // Click create button based on whether there are existing registries
      if (responseData.data.length === 0) {
        await page.getByRole('link', { name: 'Create remote registry' }).click();
      } else {
        await page.getByTestId('create-remote-registry').click();
      }

      // Verify navigation to create page
      await expect(page.getByRole('heading', { name: 'Create remote registry' })).toBeVisible();

      // Fill in form
      await page.getByTestId('name').fill(remoteRegistryName);
      await page.getByTestId('url').fill('https://console.redhat.com/api/automation-hub/');

      await page.getByTestId('Submit').click();

      // Verify navigation to details page
      await expect(
        page.getByRole('heading', { name: remoteRegistryName, exact: true })
      ).toBeVisible();

      // Navigate back to list
      await page.getByRole('link', { name: 'Remote registries', exact: true }).first().click();

      // Filter and delete
      await page.getByPlaceholder('contains').fill(remoteRegistryName);

      const row = await getTableRow(page, remoteRegistryName);
      await row.getByTestId('actions-column-cell').click();
      await page.getByTestId('delete-remote-registry').click();

      await page.locator('#confirm').check();
      await page.getByRole('button', { name: 'Delete remote registries', exact: true }).click();

      // Clear filters
      await page
        .locator('[data-ouia-component-id="page-toolbar"]')
        .getByRole('button', { name: 'Clear all filters', exact: true })
        .click();
    }
  );

  test('should edit a remote registry', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
    const remoteRegistryName = createE2EName('remote-registry');

    await navigateTo(page, 'Automation Content', 'Remote Registries');
    await expect(page.getByTestId('page-title')).toHaveText('Remote Registries');

    // Create via UI
    await page.getByTestId('create-remote-registry').click();
    await page.getByTestId('name').fill(remoteRegistryName);
    await page.getByTestId('url').fill('https://registry.redhat.io');

    await page.getByTestId('Submit').click();

    // Wait for details page to load
    await expect(
      page.getByRole('heading', { name: remoteRegistryName, exact: true })
    ).toBeVisible();

    // Navigate back to list
    await page.getByRole('link', { name: 'Remote registries', exact: true }).first().click();

    // Filter and edit
    await page.getByPlaceholder('contains').fill(remoteRegistryName);

    const row = await getTableRow(page, remoteRegistryName);
    await row.getByTestId('actions-column-cell').click();
    await page.getByTestId('edit-remote-registry').click({ force: true });

    // Verify navigation to edit page
    await expect(page.getByRole('heading', { name: `Edit ${remoteRegistryName}` })).toBeVisible();

    // Update URL
    await page.getByTestId('url').clear();
    await page.getByTestId('url').fill('https://console.redhat.com/api/automation-hub/');

    await page.getByRole('button', { name: 'Save remote registry', exact: true }).click();

    // Verify navigation back to details page
    await expect(
      page.getByRole('heading', { name: remoteRegistryName, exact: true })
    ).toBeVisible();

    // Verify updated URL
    await expect(page.getByTestId('name')).toContainText(remoteRegistryName);
    await expect(page.getByTestId('url')).toContainText(
      'https://console.redhat.com/api/automation-hub/'
    );

    // Delete the edited remote registry
    await page.getByTestId('actions-dropdown').click();
    await page.getByTestId('delete-remote-registry').click();

    await page.locator('#confirm').check();
    await page.getByRole('button', { name: 'Delete remote registries', exact: true }).click();
  });
});
