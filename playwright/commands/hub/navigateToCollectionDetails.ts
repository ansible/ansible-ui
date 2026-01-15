import { expect, Page } from '@playwright/test';
import { platformUI } from '../login';

/**
 * Navigate to a collection's detail page with retry logic.
 *
 * Retries up to 3 times with increasing delays to handle Pulp indexing delay
 * after collection approval.
 */
export async function navigateToCollectionDetails(
  page: Page,
  collection: { namespace: string; name: string },
  repository: string = 'published'
) {
  const url = `${platformUI}/content/collections/${repository}/${collection.namespace}/${collection.name}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(url);

    try {
      await expect(
        page.getByRole('heading', { name: `${collection.namespace}.${collection.name}` })
      ).toBeVisible({ timeout: 10000 });
      return;
    } catch {
      if (attempt === 3) {
        const mainContent = await page.locator('main').textContent();
        throw new Error(
          `Collection not found at ${url} after 3 attempts. Page shows: ${mainContent?.slice(0, 200)}`
        );
      }
      await page.waitForTimeout(2000 * attempt);
    }
  }
}
