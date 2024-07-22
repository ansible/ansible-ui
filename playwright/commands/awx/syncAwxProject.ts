import { expect, Page } from '@playwright/test';

export async function syncAwxProject(page: Page, projectName: string) {
  await page.click('#awx-projects');
  await page.click('#filter-input');
  await page.getByLabel('Search input').fill(projectName);
  await page.locator('#filter-input-select').getByLabel(projectName).click();
  await page.click('#filter-input');

  const td = page.locator(`td >> text=${projectName}`);
  const tr = page.locator('tr').filter({ has: td });
  await expect(tr).toContainText('Success', { timeout: 2 * 60 * 1000 });
}
