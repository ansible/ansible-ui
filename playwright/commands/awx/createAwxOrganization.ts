import { expect, Page } from '@playwright/test';
import { Organization } from '../../../frontend/awx/interfaces/Organization';
import { createE2EName } from '../createE2EName';
import { navigateTo } from '../navigateTo';

export async function createAwxOrganization(page: Page, organization: Partial<Organization> = {}) {
  organization.name = organization.name ?? createE2EName();
  await navigateTo(page, 'Access Management', 'awx-organizations');
  await page.click('#create-organization');
  await page.fill('#name', organization.name);
  await page.click('button[type="submit"]');
  await expect(page.getByRole('heading', { name: organization.name })).toBeVisible();
  return organization.name;
}
