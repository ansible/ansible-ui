import { Page } from '@playwright/test';

export async function filterTableByText({ filterValue }: { filterValue: string }, page: Page) {
  // PF 6.5.1 puts #filter-input on the TextInputGroupMain wrapper, not the nested <input>.
  await page.locator('#filter-input input, input#filter-input').fill(filterValue);
  if (await page.getByLabel('apply filter').isVisible()) {
    await page.getByLabel('apply filter').click();
    // Wait for filter to be applied - the table will update
    await page.waitForTimeout(300);
  } else {
    // No apply button means debounced input - wait for debounce to complete
    await page.waitForTimeout(500);
  }
}
