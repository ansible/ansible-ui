import { expect, Page } from '@playwright/test';
import { navigateTo } from '../navigateTo';

export async function deleteAwxOrganization(page: Page, organizationName: string) {
  await navigateTo(page, 'Access Management', 'awx-organizations');
  await page.click('#filter-input');
  await page.getByLabel('Search input').fill(organizationName);
  await page.locator('#filter-input-select').getByLabel(organizationName).click();
  await page.click('#filter-input');
  await page.click(`td >> a >> text=${organizationName}`);
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.getByText('Delete organization').click();
  await page.click('#confirm');
  await page.click('#submit');
  await expect(page.getByRole('heading', { name: 'Organizations' })).toBeVisible();
}
