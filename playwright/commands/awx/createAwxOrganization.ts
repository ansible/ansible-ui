import { expect, Page } from '@playwright/test';
import { createE2EName } from '../createE2EName';
import { navigateTo } from '../navigateTo';

export async function createAwxOrganization(
  page: Page,
  options: {
    organizationName?: string;
  } = {}
) {
  const organizationName = options.organizationName ?? createE2EName();
  await navigateTo(page, 'Access Management', 'awx-organizations');
  await page.click('#create-organization');
  await page.fill('#name', organizationName);
  await page.click('button[type="submit"]');
  await expect(page.locator('.pf-v5-c-title')).toContainText(organizationName);
  return organizationName;
}
