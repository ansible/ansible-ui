import { Page, expect } from '@playwright/test';
import { navigateTo } from '../navigateTo';

export async function createAwxTeam(page: Page, organizationName: string) {
  const randomName = 'E2E' + Math.random().toString(36).substring(7);
  await navigateTo(page, 'Access Management', 'awx-teams');
  await page.click('#create-team');
  await page.fill('#name', randomName);
  await page.click('#organization');
  await page.getByLabel('Search input').fill(organizationName);
  await page.click(`text=${organizationName}`);
  await page.click('button[type="submit"]');
  await expect(page.locator('h1')).toContainText(randomName);
  return randomName;
}
