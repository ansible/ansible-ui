import { expect, Page } from '@playwright/test';
import { navigateTo } from '../navigateTo';

export async function deleteAwxTeam(page: Page, teamName: string) {
  await navigateTo(page, 'Access Management', 'awx-teams');
  await page.click('#filter-input');
  await page.getByLabel('Search input').fill(teamName);
  await page.locator('#filter-input-select').getByLabel(teamName).click();
  await page.click('#filter-input');
  await page.click(`td >> a >> text=${teamName}`);
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.getByText('Delete team').click();
  await page.click('#confirm');
  await page.click('#submit');
  await expect(page.getByRole('heading', { name: 'Teams' })).toBeVisible();
}
