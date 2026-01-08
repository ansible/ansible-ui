import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test, Page } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/content/administration/repositories' }));
test.afterEach(setupAfter);

/**
 * Helper function to navigate to the first repository's details page
 * Note: This assumes at least one repository exists in the system
 */
async function navigateToFirstRepository(page: Page): Promise<string> {
  // Wait for table to load
  await expect(page.locator('tbody')).toBeVisible({ timeout: 10000 });

  // Get the first repository name
  const firstRowLink = page.getByRole('row').nth(1).getByRole('link').first();
  await expect(firstRowLink).toBeVisible({ timeout: 5000 });
  const repositoryName = await firstRowLink.textContent();

  expect(repositoryName).toBeTruthy();

  // Click on the repository
  await clickTableRow({ filterLabel: 'Name', text: repositoryName!.trim() }, page);

  // Verify we're on the details page
  await expect(page.getByRole('heading', { name: repositoryName!.trim() })).toBeVisible();

  return repositoryName!.trim();
}

test.describe('Repository Details - Last Synced Field', () => {
  test(
    'should display "Last synced" field with proper data-testid attributes',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateToFirstRepository(page);

      // Verify "Last synced" field exists with correct data-testid attributes
      await expect(page.getByTestId('label-last-synced')).toBeVisible();
      await expect(page.getByTestId('last-synced')).toBeVisible();
    }
  );

  test(
    'should show appropriate content based on repository sync state',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateToFirstRepository(page);

      // Get the "Remote" value to determine expected state
      const remoteValue = page.getByTestId('remote');
      await expect(remoteValue).toBeVisible();
      const remoteText = await remoteValue.textContent();

      // Get the "Last synced" value
      const lastSyncedValue = page.getByTestId('last-synced');
      await expect(lastSyncedValue).toBeVisible();
      const lastSyncedText = await lastSyncedValue.textContent();

      expect(lastSyncedText).toBeTruthy();

      if (remoteText?.includes('None')) {
        // Repository has no remote configured: should show "No remote"
        // Note: This text is internationalized and may differ in non-English locales
        expect(lastSyncedText?.trim()).toBe('No remote');
      } else {
        // Repository has a remote: should show either "Never synced" or a formatted date
        const isNeverSynced = lastSyncedText?.trim() === 'Never synced';
        // Check if text contains date-like patterns (handles various DateTimeCell formats)
        // This is a simplified check - DateTimeCell may format dates differently based on locale
        const hasDateContent =
          /\d{1,2}\/\d{1,2}\/\d{4}/.test(lastSyncedText || '') || // MM/DD/YYYY or DD/MM/YYYY
          /\d{4}-\d{2}-\d{2}/.test(lastSyncedText || '') || // YYYY-MM-DD
          lastSyncedText?.includes(','); // "Jan 1, 2024" format

        expect(hasDateContent || isNeverSynced).toBe(true);
      }
    }
  );
});
