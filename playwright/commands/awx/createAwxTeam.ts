import { Page, expect } from '@playwright/test';
import { createE2EName } from '../createE2EName';
import { navigateTo } from '../navigateTo';

export async function createAwxTeam(
  page: Page,
  options: { teamName?: string; organizationName: string }
) {
  const teamName = options.teamName ?? createE2EName();
  await navigateTo(page, 'Access Management', 'awx-teams');
  await page.getByRole('button', { name: 'Create team' }).click();
  await page.fill('#name', teamName);
  await page.click('#organization');
  await page.getByLabel('Search input').fill(options.organizationName);
  await page.click(`text=${options.organizationName}`);
  await page.click('button[type="submit"]');
  await expect(page.locator('.pf-v5-c-title')).toContainText(teamName);
  return teamName;
}
