import { Page } from '@playwright/test';

export async function clickBreadcrumbLink(breadcrumbName: string, page: Page) {
  await page.getByLabel('Breadcrumb').getByRole('link', { name: breadcrumbName }).click();
}
