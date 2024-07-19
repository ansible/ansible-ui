import { expect, Page } from '@playwright/test';

export async function deleteAwxProject(page: Page, name: string) {
  await page.click('#awx-projects');
  await page.click('#filter-input');
  await page.getByLabel('Search input').fill(name);
  await page.locator('#filter-input-select').getByLabel(name).click();
  await page.click('#filter-input');
  await page.click(`td >> a >> text=${name}`);
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.getByText('Delete project').click();
  await page.click('#confirm');
  await page.click('#submit');
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
}
