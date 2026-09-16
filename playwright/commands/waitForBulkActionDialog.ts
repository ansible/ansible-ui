import { expect, Page } from '@playwright/test';

export interface WaitForBulkActionDialogOptions {
  timeout?: number;
  /**
   * When true, a failed bulk action does not throw after the dialog is closed.
   * Use in teardown or cleanup where a failed delete should not fail the test.
   * Leave unset (or false) when the test is asserting a successful assignment or delete.
   */
  allowFailure?: boolean;
}

/**
 * Wait for a bulk-action progress dialog to finish and dismiss.
 *
 * On success the dialog auto-closes after about 1s. On failure it stays open
 * with Retry/Close — Close must be clicked so later navigation is not blocked
 * by the overlay.
 *
 * Terminal states are polled independently rather than combined with locator.or():
 * Error and Retry are often visible together, which is a Playwright strict-mode
 * violation when used with toBeVisible().
 */
export async function waitForBulkActionDialog(
  page: Page,
  options?: WaitForBulkActionDialogOptions
): Promise<void> {
  const timeout = options?.timeout ?? 30000;
  const dialog = page.getByRole('dialog');
  const retry = dialog.getByRole('button', { name: 'Retry' });
  const errorBar = dialog.getByRole('progressbar', { name: 'Error' });
  const successBar = dialog.getByRole('progressbar', { name: 'Success' });

  await expect(dialog).toBeVisible({ timeout });

  await expect
    .poll(
      async () => {
        if (await dialog.isHidden().catch(() => false)) {
          return 'done';
        }
        if (await retry.isVisible().catch(() => false)) {
          return 'done';
        }
        if (await errorBar.isVisible().catch(() => false)) {
          return 'done';
        }
        if (await successBar.isVisible().catch(() => false)) {
          return 'done';
        }
        return 'pending';
      },
      { timeout }
    )
    .toBe('done');

  const failed =
    (await dialog.isVisible().catch(() => false)) &&
    ((await retry.isVisible().catch(() => false)) ||
      (await errorBar.isVisible().catch(() => false)));

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
