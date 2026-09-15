import { expect, Page } from '@playwright/test';

/**
 * Wait for a bulk-action progress dialog to finish and dismiss.
 *
 * On success the dialog auto-closes after about 1s. On failure it stays open
 * with Retry/Close — Close must be clicked so later navigation is not blocked
 * by the overlay.
 */
export async function waitForBulkActionDialog(
  page: Page,
  options?: { timeout?: number; allowFailure?: boolean }
): Promise<void> {
  const timeout = options?.timeout ?? 30000;
  const dialog = page.getByRole('dialog');

  await expect(dialog).toBeVisible({ timeout });

  const success = dialog.getByRole('progressbar', { name: 'Success' });
  const errorBar = dialog.getByRole('progressbar', { name: 'Error' });
  const retry = dialog.getByRole('button', { name: 'Retry' });

  await expect(success.or(errorBar).or(retry)).toBeVisible({ timeout });

  const failed =
    (await retry.isVisible().catch(() => false)) || (await errorBar.isVisible().catch(() => false));

  if (failed) {
    const errorText =
      (
        await dialog
          .locator('[role="gridcell"]')
          .last()
          .textContent()
          .catch(() => '')
      )?.trim() ?? '';
    const closeButton = dialog.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
    await expect(dialog).toBeHidden({ timeout });
    if (!options?.allowFailure) {
      throw new Error(`Bulk action failed${errorText ? `: ${errorText}` : ''}`);
    }
    return;
  }

  await expect(dialog).toBeHidden({ timeout });
}
