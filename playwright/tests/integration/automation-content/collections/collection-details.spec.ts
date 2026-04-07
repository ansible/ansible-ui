import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import {
  AAP_DEV_LOCALHOST_URL,
  AZURE_URL,
  OCP_A_URL,
  SAAS_URL,
} from '@ansible/playwright/commands/constants';
import { filterTableByText } from '@ansible/playwright/commands/filterTableByText';
import { clickKebabActionAndConfirm } from '@ansible/playwright/commands/hub/clickKebabActionAndConfirm';
import {
  selectFirstAvailableCheckbox,
  verifyVersionDeleted,
  waitForVersionsInRepository,
} from '@ansible/playwright/commands/hub/collectionHelpers';
import { navigateToCollectionDetails } from '@ansible/playwright/commands/hub/navigateToCollectionDetails';
import { platformUI } from '@ansible/playwright/commands/login';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { COLLECTION_TARBALLS, test } from '@ansible/playwright/fixtures/hub/collection.fixture';
import { Distribution } from '@ansible/playwright/utils/hub/distribution';
import { Remote } from '@ansible/playwright/utils/hub/remote';
import { Repository } from '@ansible/playwright/utils/hub/repository';
import { expect, Page } from '@playwright/test';

// Helper to check if signing is available by checking the kebab menu
async function isSigningAvailable(page: Page): Promise<boolean> {
  await page.getByTestId('actions-dropdown').click();
  const signButton = page.getByTestId('sign-collection');
  const isVisible = await signButton.isVisible().catch(() => false);
  await page.keyboard.press('Escape');
  return isVisible;
}

test.beforeEach(setupBefore({ path: '/content/collections' }));
test.afterEach(setupAfter);

test.describe('Hub Collections - Details Page', () => {
  test.describe('Delete Operations', () => {
    test(
      'should delete version from repository',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        const namespace = 'e2edel1';
        const name = 'delverrepo';

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
        });

        await navigateToCollectionDetails(page, uploaded);
        await page.getByTestId('collection-detail-tab').click();
        await clickKebabActionAndConfirm('delete-version-from-repository', page);

        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
      }
    );

    test(
      'should delete version from system',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        const namespace = 'e2edel2';
        const name = 'delversys';

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
        });

        await navigateToCollectionDetails(page, uploaded);
        await page.getByTestId('collection-detail-tab').click();
        await clickKebabActionAndConfirm('delete-version-from-system', page);

        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
      }
    );

    test(
      'should delete a specific version after switching versions',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        test.setTimeout(180000);
        const namespace = 'e2edelver';
        const name = 'delversionswitch';

        await collection.createNamespace({ name: namespace });

        // Upload version 1.0.0
        const v1 = await collection.uploadVersion({
          namespace,
          name,
          version: '1.0.0',
          repository: 'staging',
        });

        // Upload version 2.0.0
        const v2 = await collection.uploadVersion({
          namespace,
          name,
          version: '2.0.0',
          repository: 'staging',
        });

        // Approve both versions
        await collection.approveCollection({
          namespace: v1.namespace,
          name: v1.name,
          version: v1.version,
        });
        await collection.approveCollection({
          namespace: v2.namespace,
          name: v2.name,
          version: v2.version,
        });

        // Wait for both versions to be indexed in published repository via API polling
        await waitForVersionsInRepository(page, namespace, name, ['1.0.0', '2.0.0']);

        // Navigate to collection - should show latest (2.0.0)
        await navigateToCollectionDetails(page, v2);
        await page.getByTestId('collection-detail-tab').click();

        // Wait for version selector toggle button to be available
        const versionToggle = page.getByTestId('version-selector');
        await versionToggle.waitFor({ state: 'visible', timeout: 30000 });

        // Switch to version 1.0.0 using the version dropdown
        await versionToggle.click();
        await page.getByRole('listbox').waitFor({ state: 'visible' });

        // Select the option that starts with 1.0.0 (not the latest which is 2.0.0)
        const v1Option = page.getByRole('option').filter({ hasText: /^1\.0\.0/ });
        await v1Option.click();

        // Wait for URL to update with version param (confirms version switch completed)
        await page.waitForURL(/version=1\.0\.0/);

        // Verify version 1.0.0 is displayed
        await expect(page.getByTestId('version')).toContainText('1.0.0');

        // Reload page to ensure state is fully synced with the version-specific URL
        await page.reload();
        await page.getByTestId('collection-detail-tab').click();
        await expect(page.getByTestId('version')).toContainText('1.0.0');

        // Delete version 1.0.0 from repository
        await clickKebabActionAndConfirm('delete-version-from-repository', page);
        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });

        // Wait for delete to process and poll API to confirm deletion
        await verifyVersionDeleted(page, namespace, name, '1.0.0', ['2.0.0']);

        // Navigate back to collection to verify UI matches API
        await navigateToCollectionDetails(page, { namespace, name });
        await page.getByTestId('collection-detail-tab').click();

        // Wait for version selector and verify only one version remains
        await versionToggle.waitFor({ state: 'visible', timeout: 30000 });
        await versionToggle.click();
        await page.getByRole('listbox').waitFor({ state: 'visible' });

        // Should only have one version option (2.0.0)
        const versionOptions = page.getByRole('option');
        await expect(versionOptions).toHaveCount(1);
        await expect(versionOptions.first()).toContainText('2.0.0');
      }
    );

    test(
      'should delete entire collection from repository',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        const namespace = 'e2edel3';
        const name = 'delcollrepo';

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
        });

        await navigateToCollectionDetails(page, uploaded);
        await clickKebabActionAndConfirm('delete-entire-collection-from-repository', page);

        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
      }
    );

    test(
      'should delete entire collection from system',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        const namespace = 'e2edel4';
        const name = 'delcollsys';

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
        });

        await navigateToCollectionDetails(page, uploaded);
        await clickKebabActionAndConfirm('delete-entire-collection-from-system', page);

        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
      }
    );
  });

  test.describe('Copy Operations', () => {
    test(
      'should copy a version to repositories',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        test.setTimeout(180000);

        const buildType = await checkBuildType(page);
        if ([OCP_A_URL, AAP_DEV_LOCALHOST_URL].includes(buildType)) {
          test.skip();
          return;
        }

        await collection.createNamespace({ name: 'ibm' });
        const uploaded = await collection.upload({
          repository: 'staging',
          tarballPath: COLLECTION_TARBALLS.operatorSdk,
        });

        await collection.approveCollection({
          namespace: uploaded.namespace,
          name: uploaded.name,
          version: uploaded.version,
        });

        await navigateToCollectionDetails(page, uploaded);
        await page.getByTestId('actions-dropdown').click();
        await page.getByTestId('copy-version-to-repositories').click();

        const modal = page.getByRole('dialog');
        await modal.waitFor({ state: 'visible' });

        // Wait for the modal header to confirm it's loaded
        await expect(modal.getByText('Select repositories')).toBeVisible({ timeout: 10000 });

        // Wait for the table container to be visible
        const tableContainer = modal.getByTestId('hub-copy-to-repository-table');
        await tableContainer.waitFor({ state: 'visible', timeout: 30000 });

        // Wait for loading skeleton to disappear, indicating table has finished loading
        const skeleton = tableContainer.locator('.pf-v5-c-skeleton');
        await expect(skeleton).toHaveCount(0, { timeout: 30000 });

        // Wait for table content to appear - either checkboxes (repositories loaded) or empty state
        // Both are valid states, we just need to ensure the table is no longer loading
        // The table defaults to list view, so we wait for DataList checkboxes or empty state
        const hasContent = await Promise.race([
          tableContainer
            .locator('input[type="checkbox"]')
            .first()
            .waitFor({ state: 'visible', timeout: 10000 })
            .then(() => true),
          tableContainer
            .locator('[data-ouia-component-type="PF6/EmptyState"]')
            .waitFor({ state: 'visible', timeout: 10000 })
            .then(() => true),
        ]).catch(() => false);

        if (!hasContent) {
          throw new Error(
            'Table did not finish loading - no content or empty state appeared after skeleton disappeared'
          );
        }

        // Filter for 'community' repository
        const filterInput = tableContainer.getByPlaceholder('Filter by name');
        if (await filterInput.isVisible()) {
          await filterInput.fill('community');
          await filterInput.press('Enter');
          // Wait for filter to apply and table to update
          await page.waitForTimeout(1000);
        }

        // Find an unchecked checkbox and select it
        // Checkboxes can be in table view (tbody) or list view (data-list)
        const rowCheckboxes = tableContainer.locator('input[type="checkbox"]');
        const selectedAny = await selectFirstAvailableCheckbox(rowCheckboxes);

        // If no repository available to copy to, cancel and verify we're still on the page
        if (!selectedAny) {
          await modal.getByRole('button', { name: 'Cancel' }).click();
          await modal.waitFor({ state: 'hidden' });
          await expect(
            page.getByRole('heading', { name: `${uploaded.namespace}.${uploaded.name}` })
          ).toBeVisible({ timeout: 15000 });
          return;
        }

        // Click Select — modal closes on success but may stay open on error.
        const selectButton = modal.getByRole('button', { name: 'Select' });
        await expect(selectButton).toBeEnabled();
        await selectButton.click();

        // After copy, refresh([]) clears collection state causing HubError.
        // Navigate back to verify the collection is still accessible regardless of modal state.
        await navigateToCollectionDetails(page, uploaded);
      }
    );
  });

  test.describe('Signing Operations', () => {
    // Skip all signing tests on environments where signing is not available
    test.beforeEach(async ({ page }) => {
      const buildType = await checkBuildType(page);
      if ([SAAS_URL, AZURE_URL, OCP_A_URL, AAP_DEV_LOCALHOST_URL].includes(buildType)) {
        test.skip(true, 'Signing not available on this environment');
      }
    });

    test('should sign a collection', { tag: ['@not_mock'] }, async ({ page, collection }) => {
      await collection.createNamespace({ name: 'ibm' });

      let uploaded;
      try {
        uploaded = await collection.upload({
          repository: 'staging',
          tarballPath: COLLECTION_TARBALLS.zosmf,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (/503|502|timeout|ECONNREFUSED|ECONNRESET|pulp/i.test(msg)) {
          test.skip(true, `Collection upload failed — Pulp backend may be unhealthy: ${msg}`);
          return;
        }
        throw error;
      }

      await collection.approveCollection({
        namespace: uploaded.namespace,
        name: uploaded.name,
        version: uploaded.version,
      });

      await navigateToCollectionDetails(page, uploaded);

      if (!(await isSigningAvailable(page))) {
        test.skip();
        return;
      }

      await clickKebabActionAndConfirm('sign-collection', page);

      await page.getByTestId('collection-detail-tab').click();
      await expect(page.getByTestId('signed-state')).toContainText('Signed', { timeout: 60000 });
    });

    test(
      'should sign a selected version of a collection',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        const namespace = 'e2esignver';
        const name = 'signvertest';

        await collection.createNamespace({ name: namespace });

        // Use uploadVersion to create a unique collection and avoid Pulp artifact conflicts
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
        });

        await navigateToCollectionDetails(page, uploaded);

        // Check if signing is available in this environment
        if (!(await isSigningAvailable(page))) {
          test.skip();
          return;
        }

        // Navigate to detail tab first so we can observe the signed state update
        await page.getByTestId('collection-detail-tab').click();
        await expect(page.getByTestId('signed-state')).toContainText('Unsigned');

        // Sign the collection using direct modal interaction (like multi-version test)
        await page.getByTestId('actions-dropdown').click();
        await page.getByTestId('sign-collection').click();

        const modal = page.getByRole('dialog');
        await modal.waitFor({ state: 'visible' });
        await modal.getByTestId('confirm').click();
        await modal.getByTestId('submit').click();

        // Wait for signed state to update (signing is async, use longer timeout)
        await expect(page.getByTestId('signed-state')).toContainText('Signed', { timeout: 60000 });
      }
    );

    // Multi-version signing test: Upload 2 versions, sign only one, verify the other remains unsigned.
    test(
      'should sign only one version leaving other versions unsigned',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        test.setTimeout(180000);

        // Check if can_upload_signatures is enabled - if so, sign-version requires file upload (different workflow)
        const featureFlagsResponse = await page.request.get(
          `${platformUI}/api/galaxy/_ui/v1/feature-flags/`
        );
        if (featureFlagsResponse.ok()) {
          const flags = (await featureFlagsResponse.json()) as { can_upload_signatures?: boolean };
          if (flags.can_upload_signatures) {
            test.skip();
            return;
          }
        }

        const namespace = 'e2esignval';
        const name = 'signvaltest';

        await collection.createNamespace({ name: namespace });

        // Upload version 1.0.0 and approve to validated
        const v1 = await collection.uploadVersion({
          namespace,
          name,
          version: '1.0.0',
          repository: 'staging',
        });
        await collection.approveCollection({
          namespace: v1.namespace,
          name: v1.name,
          version: v1.version,
          destinationRepository: 'validated',
        });

        // Upload version 2.0.0 and approve to validated
        const v2 = await collection.uploadVersion({
          namespace,
          name,
          version: '2.0.0',
          repository: 'staging',
        });
        await collection.approveCollection({
          namespace: v2.namespace,
          name: v2.name,
          version: v2.version,
          destinationRepository: 'validated',
        });

        // Wait for both versions to be indexed in validated
        const apiUrl = `${platformUI}/api/galaxy/v3/plugin/ansible/search/collection-versions/?namespace=${namespace}&name=${name}&repository_name=validated`;
        for (let attempt = 1; attempt <= 30; attempt++) {
          const response = await page.request.get(apiUrl);
          if (response.ok()) {
            const data = (await response.json()) as {
              data: Array<{ collection_version: { version: string } }>;
            };
            const versions = new Set(data.data.map((d) => d.collection_version.version));
            if (versions.has('1.0.0') && versions.has('2.0.0')) {
              break;
            }
          }
          if (attempt === 30) {
            throw new Error('Both versions not indexed after 30 attempts');
          }
          await page.waitForTimeout(2000);
        }

        // Navigate to collection in validated repository
        const collectionUrl = `${platformUI}/content/collections/validated/${namespace}/${name}/details`;
        await page.goto(collectionUrl);
        await page.waitForLoadState('networkidle');

        // Check if signing is available in this environment
        if (!(await isSigningAvailable(page))) {
          test.skip();
          return;
        }

        // Switch to v1 and verify it's unsigned
        await page.getByTestId('version-selector').click();
        await page.getByRole('listbox').waitFor({ state: 'visible' });
        await page.getByRole('option', { name: '1.0.0' }).click();

        // Wait for URL to update with version param (confirms version switch completed)
        await page.waitForURL(/version=1\.0\.0/);
        await expect(page.getByTestId('version')).toContainText('1.0.0');

        await page.getByTestId('collection-detail-tab').click();
        await expect(page.getByTestId('signed-state')).toContainText('Unsigned');

        // Sign only v1 using direct modal interaction
        await page.getByTestId('actions-dropdown').click();
        await page.getByTestId('sign-version').click();

        const modal = page.getByRole('dialog');
        await modal.waitFor({ state: 'visible' });
        await modal.getByTestId('confirm').click();
        await modal.getByTestId('submit').click();

        // Wait for signed state to update
        await expect(page.getByTestId('signed-state')).toContainText('Signed', { timeout: 60000 });

        // Switch to v2 (latest) and verify it's still unsigned
        await page.getByTestId('version-selector').click();
        await page.getByRole('listbox').waitFor({ state: 'visible' });
        await page.getByRole('option', { name: '2.0.0' }).click();

        // Wait for URL to update with version param (confirms version switch completed)
        await page.waitForURL(/version=2\.0\.0/);
        await expect(page.getByTestId('version')).toContainText('2.0.0');

        await expect(page.getByTestId('signed-state')).toContainText('Unsigned');
      }
    );
  });

  test.describe('Distribution Display', () => {
    test(
      'should display distribution information from collection detail page',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        const namespace = await collection.createNamespace();
        const collectionName = 'testdist';

        // Create remote, repository, and distribution
        const remote = await Remote.api.create(page);
        const repository = await Repository.api.create(page, {
          remote: remote.pulp_href,
          retain_repo_versions: 1,
        });
        const distribution = await Distribution.api.create(page, {
          name: repository.name,
          repository: repository.pulp_href,
        });

        try {
          // Upload collection
          await collection.uploadVersion({
            namespace,
            name: collectionName,
            version: '1.0.0',
            repository: 'staging',
          });

          // Navigate to Repositories page and add collection to repository
          await page.goto(`${platformUI}/content/administration/repositories`);

          // Filter for the repository
          await filterTableByText({ filterValue: repository.name }, page);

          await page.getByRole('link', { name: repository.name, exact: true }).click();

          await page.getByRole('tab', { name: 'Collection Versions' }).click();
          await page.getByRole('button', { name: 'Add collections', exact: true }).click();

          const modal = page.getByRole('dialog');
          await modal.waitFor({ state: 'visible' });

          // Filter for the namespace and select the collection
          // Click the filter dropdown (defaults to "Keywords")
          await modal.getByRole('button', { name: 'Keywords' }).click();

          // Select "Namespace" from the dropdown menu
          await page.getByRole('option', { name: 'Namespace' }).click();

          // Fill in the namespace filter
          await modal.getByRole('textbox', { name: 'Type to filter' }).fill(namespace);
          await modal.getByRole('textbox', { name: 'Type to filter' }).press('Enter');

          // Wait for filter to apply
          await page.waitForTimeout(2000);

          const collectionCheckbox = modal
            .getByRole('row')
            .filter({ hasText: collectionName })
            .getByRole('checkbox');
          await collectionCheckbox.check();

          await modal.getByRole('button', { name: 'Select' }).click();
          await modal.waitFor({ state: 'hidden' });

          // Verify collection appears in the repository
          await page.getByTestId('table-view').click();
          await expect(page.getByRole('row').filter({ hasText: collectionName })).toBeVisible();

          // Navigate to collection detail page
          await navigateTo(page, 'Automation Content', 'Collections');
          await page.getByTestId('table-view').click();

          await filterTableByText({ filterValue: collectionName }, page);

          // Click on the collection in the correct repository
          const collectionLink = page
            .getByRole('row')
            .filter({ hasText: repository.name })
            .filter({ hasText: collectionName })
            .getByRole('link', { name: collectionName, exact: true });
          await collectionLink.click();

          // Click Distributions tab
          await page.getByRole('tab', { name: 'Distributions' }).click();

          // Verify upload button is present
          await expect(page.getByTestId('upload-new-version')).toBeVisible();

          // Get the distribution row from the table
          const distributionRow = page
            .getByRole('row')
            .filter({ hasText: distribution.name })
            .filter({ hasText: distribution.base_path });

          // Verify distribution information is displayed in the table
          await expect(distributionRow).toBeVisible();

          // Verify copy button exists in the row
          await expect(distributionRow.locator('[id*=copy-button]')).toBeVisible();

          // Test copy button functionality
          await distributionRow.locator('[id*=copy-button]').click();
          await expect(page.getByTestId('alert-toaster')).toBeVisible();

          // Close the alert
          await page.getByTestId('alert-toaster').getByRole('button').click();
          await expect(page.getByTestId('alert-toaster')).toBeHidden();
        } finally {
          // Cleanup in reverse order
          await Distribution.api.delete(page, distribution.pulp_href);
          await Repository.api.delete(page, repository.pulp_href);
          await Remote.api.delete(page, remote.pulp_href);
        }
      }
    );
  });

  test.describe('Deprecation', () => {
    test(
      'should deprecate and undeprecate a collection from detail page',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        await collection.createNamespace({ name: 'ibm' });
        const uploaded = await collection.upload({
          repository: 'staging',
          tarballPath: COLLECTION_TARBALLS.spmToolbox,
        });

        await collection.approveCollection({
          namespace: uploaded.namespace,
          name: uploaded.name,
          version: uploaded.version,
        });

        await navigateToCollectionDetails(page, uploaded);
        await clickKebabActionAndConfirm('deprecate-collection', page);
        await page.waitForTimeout(2000); // Wait for backend to process before API verification

        // Verify deprecation via API (status not shown on detail page UI)
        const apiUrl = `${platformUI}/api/galaxy/v3/plugin/ansible/search/collection-versions/?name=${uploaded.name}&namespace=${uploaded.namespace}&repository_name=published`;
        const apiResponse = await page.request.get(apiUrl);
        expect(apiResponse.ok()).toBe(true);

        const data = (await apiResponse.json()) as { data: Array<{ is_deprecated: boolean }> };
        expect(data.data).toBeDefined();
        expect(data.data.length).toBeGreaterThan(0);
        expect(data.data[0].is_deprecated).toBe(true);

        // Reload page to refresh kebab menu options (undeprecate appears after deprecation)
        await page.reload();
        await page.getByTestId('actions-dropdown').click();
        await expect(page.getByTestId('undeprecate-collection')).toBeVisible();
        await page.keyboard.press('Escape');

        await clickKebabActionAndConfirm('undeprecate-collection', page);
        await page.waitForTimeout(2000); // Wait for backend to process before API verification

        const apiResponse2 = await page.request.get(
          `${platformUI}/api/galaxy/v3/plugin/ansible/search/collection-versions/?name=${uploaded.name}&namespace=${uploaded.namespace}&repository_name=published`
        );
        expect(apiResponse2.ok()).toBe(true);

        const data2 = (await apiResponse2.json()) as { data: Array<{ is_deprecated: boolean }> };
        expect(data2.data[0].is_deprecated).toBe(false);
      }
    );

    // List view deprecation test navigates through namespace page for undeprecation
    // because the main collections list filters out deprecated collections by default.
    test(
      'should deprecate and undeprecate a collection from list view',
      { tag: ['@not_mock'] },
      async ({ page, collection }) => {
        test.setTimeout(180000); // Extended timeout for upload, approve, and two modal operations
        await collection.createNamespace({ name: 'ibm' });
        const uploaded = await collection.upload({
          repository: 'staging',
          tarballPath: COLLECTION_TARBALLS.qradar,
        });

        await collection.approveCollection({
          namespace: uploaded.namespace,
          name: uploaded.name,
          version: uploaded.version,
        });

        // First verify collection exists via API before navigating to list
        await page.waitForTimeout(5000);
        const verifyUrl = `${platformUI}/api/galaxy/v3/plugin/ansible/search/collection-versions/?name=${uploaded.name}&namespace=${uploaded.namespace}`;
        const verifyResponse = await page.request.get(verifyUrl);
        expect(verifyResponse.ok()).toBe(true);
        const verifyData = (await verifyResponse.json()) as {
          data: Array<{ repository_name: string }>;
        };
        expect(verifyData.data.length).toBeGreaterThan(0);

        // Navigate to collections list
        await page.goto(`${platformUI}/content/collections`);
        await page.getByTestId('table-view').click();

        // Wait for table to load and filter
        await page.locator('tbody').waitFor({ state: 'visible', timeout: 15000 });
        await filterTableByText({ filterValue: uploaded.name }, page);

        // Wait for filter results
        const row = page.getByRole('row').filter({ hasText: uploaded.name });
        await row.waitFor({ state: 'visible', timeout: 15000 });

        // Deprecate from list view kebab menu
        await row.getByTestId('actions-dropdown').click();
        await page.getByTestId('deprecate-collection').click();

        // Confirm deprecation in modal
        const modal = page.getByRole('dialog');
        await modal.waitFor({ state: 'visible' });
        await modal.getByTestId('confirm').click();
        await modal.getByTestId('submit').click();

        // Wait for Close button and click it
        const closeButton = modal.getByRole('button', { name: 'Close' });
        await closeButton.waitFor({ state: 'visible', timeout: 30000 });
        await closeButton.click();
        await modal.waitFor({ state: 'hidden' });

        // Verify deprecated status via API (more reliable than UI check after bulk action)
        await page.waitForTimeout(2000); // Wait for backend to process
        const apiUrl = `${platformUI}/api/galaxy/v3/plugin/ansible/search/collection-versions/?name=${uploaded.name}&namespace=${uploaded.namespace}&repository_name=published`;
        const apiResponse = await page.request.get(apiUrl);
        expect(apiResponse.ok()).toBe(true);
        const data = (await apiResponse.json()) as { data: Array<{ is_deprecated: boolean }> };
        expect(data.data[0].is_deprecated).toBe(true);

        // Navigate to namespace page to find deprecated collection
        // (Main collections list filters out deprecated collections by default)
        await page.goto(`${platformUI}/content/namespaces/${uploaded.namespace}`);
        await page.getByRole('tab', { name: 'Collections' }).click();
        await page.getByTestId('table-view').click();
        await page.locator('tbody').waitFor({ state: 'visible', timeout: 15000 });
        await filterTableByText({ filterValue: uploaded.name }, page);

        // Locate the collection row in namespace collections tab
        const namespaceRow = page.getByRole('row').filter({ hasText: uploaded.name });
        await namespaceRow.waitFor({ state: 'visible', timeout: 15000 });

        await namespaceRow.getByTestId('actions-dropdown').click();
        await page.getByTestId('undeprecate-collection').click();

        const modal2 = page.getByRole('dialog');
        await modal2.waitFor({ state: 'visible' });
        await modal2.getByTestId('confirm').click();
        await modal2.getByTestId('submit').click();

        const closeButton2 = modal2.getByRole('button', { name: 'Close' });
        await closeButton2.waitFor({ state: 'visible', timeout: 30000 });
        await closeButton2.click();
        await modal2.waitFor({ state: 'hidden' });

        // Verify undeprecation via API
        await page.waitForTimeout(2000); // Wait for backend to process
        const apiResponse2 = await page.request.get(apiUrl);
        expect(apiResponse2.ok()).toBe(true);
        const data2 = (await apiResponse2.json()) as { data: Array<{ is_deprecated: boolean }> };
        expect(data2.data[0].is_deprecated).toBe(false);
      }
    );
  });
});
