import { expect, test } from '@playwright/test';
import { filterTableByText } from '@ansible/playwright/commands/filterTableByText';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { HubExecutionEnvironment, RemoteRegistry } from '@ansible/playwright/utils';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test.describe('Hub - Execution Environment - Signing', () => {
  test(
    'should successfully sign execution environment from Docker registry',
    { tag: ['@not_mock', '@tier1'] },
    async ({ page }) => {
      // Set test timeout to 5 minutes to allow for sync and signing operations
      test.setTimeout(300000);

      const remoteRegistryName = createE2EName('remote-registry');
      const remoteRegistry = await RemoteRegistry.api.create(page, {
        name: remoteRegistryName,
        url: 'https://quay.io',
      });

      const executionEnvironment = await HubExecutionEnvironment.api.create(page, {
        registry: remoteRegistry.id,
        upstream_name: 'ansible/awx-ee',
        include_tags: ['latest'],
      });

      await test.step('Navigate to execution environment details', async () => {
        await navigateTo(page, 'Automation Content', 'Execution Environments');
        await expect(page.getByTestId('page-title')).toHaveText('Execution Environments');

        await filterTableByText({ filterValue: executionEnvironment.name }, page);
        await page.getByRole('link', { name: executionEnvironment.name, exact: true }).click();
        await expect(page.getByTestId('page-title')).toHaveText(executionEnvironment.name);
      });

      await test.step('Sync execution environment via API', async () => {
        // Use the API sync method which properly waits for Pulp task completion
        await HubExecutionEnvironment.api.sync(page, executionEnvironment.name);

        // Refresh the page data to ensure UI reflects the synced state
        await page.getByTestId('refresh').click();

        // Verify the sync status shows as completed
        await expect(page.getByText('Completed')).toBeVisible({ timeout: 10000 });
      });

      await test.step('Sign execution environment', async () => {
        await page.getByTestId('actions-dropdown').click();

        // Check if signing option is available
        const signMenuItem = page.getByRole('menuitem', { name: 'Sign execution environment' });
        const isSigningAvailable = await signMenuItem.isVisible().catch(() => false);

        if (!isSigningAvailable) {
          await page.keyboard.press('Escape');
          test.skip(true, 'Signing not available - requires signing keys to be configured');
          return;
        }

        const ariaDisabled = await signMenuItem.getAttribute('aria-disabled');
        const isDisabled = ariaDisabled === 'true';

        if (isDisabled) {
          await page.keyboard.press('Escape');
          test.skip(
            true,
            'Container signing disabled - requires permissions and signing service configuration'
          );
          return;
        }

        await signMenuItem.click();

        // Wait for and confirm the sign modal
        const modal = page.getByRole('dialog', { name: 'Sign environments' });
        await expect(modal).toBeVisible();
        await page.getByTestId('confirm').check();
        await page.getByRole('button', { name: 'Sign execution environments' }).click();

        // Wait for success message in the modal (API call succeeded, but task may still be running)
        await expect(modal).toContainText('Success', { timeout: 100000 });

        // Wait for modal to disappear (it auto-closes after success)
        await expect(modal).not.toBeVisible({ timeout: 30000 });

        // Refresh page data to fetch updated sign_state from backend
        await page.getByTestId('refresh').click();

        // Wait for signed status with extended timeout (signing is async, similar to collections)
        await expect(page.getByText('Signed')).toBeVisible({ timeout: 60000 });
      });

      await test.step('Delete remote registry and execution environment', async () => {
        await HubExecutionEnvironment.api.delete(page, executionEnvironment.name);
        await RemoteRegistry.api.delete(page, remoteRegistry.id);
      });
    }
  );
});
