import { Page } from '@playwright/test';

export async function filterTableByText(organizationName: string, page: Page) {
  await page.getByLabel('Type to filter').fill(organizationName);
  await page.getByLabel('apply filter').click();
}
