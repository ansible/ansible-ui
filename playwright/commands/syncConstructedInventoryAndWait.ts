import { expect, Page } from '@playwright/test';
import { waitForJobStatus } from './waitForJobStatus';

export async function syncConstructedInventoryAndWait(
  page: Page,
  desiredStatus: 'successful' | 'failed'
) {
  const syncResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/inventory_sources/') &&
      response.url().includes('/update/') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'Sync inventory' }).click();
  const syncResponse = await syncResponsePromise;
  expect(syncResponse.status()).toBe(202);
  const inventoryUpdate = (await syncResponse.json()) as { id: number };
  await waitForJobStatus(
    {
      jobType: 'inventory_updates',
      jobId: inventoryUpdate.id,
      desiredStatus: desiredStatus === 'failed' ? ['failed', 'error'] : 'successful',
      timeout: 60000,
    },
    page
  );
}
