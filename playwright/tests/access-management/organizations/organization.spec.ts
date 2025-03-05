import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createOrganization, deleteOrganization } from './organization-utils';
import { assertNoResultsFoundForResource } from '../../../commands/assertNoResultsFoundForResource';
import { clickBreadcrumbLink } from '../../../commands/clickBreadcrumbLink';
import { mockFeatureFlags } from '../../util/featureFlags';
import { navigateTo } from '../../../commands/navigateTo';
import { createE2EName } from '../../../commands/createE2EName';
test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test('organization - create and delete', { tag: ['@not_mock'] }, async ({ page }) => {
  const organizationName = await createOrganization(page);
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  await clickBreadcrumbLink('Organizations', page);
  await deleteOrganization(organizationName, page);
  await assertNoResultsFoundForResource(organizationName, 'contains', page, true);
});

test('organization - create/edit PAC enabled', { tag: ['@not_mock'] }, async ({ page }) => {
  await mockFeatureFlags(page, { FEATURE_POLICY_AS_CODE_ENABLED: true });
  const organizationName = createE2EName();
  const opaPolicyPath = 'test/test';
  await navigateTo(page, 'Access Management', 'Organizations');
  await page.getByRole('link', { name: 'Create organization', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'OPA policy' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(organizationName);
  await page.getByRole('textbox', { name: 'OPA policy' }).click();
  await page.getByRole('textbox', { name: 'OPA policy' }).fill(opaPolicyPath);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('dl')).toContainText('OPA policy');
  await expect(page.locator('#opa-policy')).toContainText(opaPolicyPath);
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  await expect(page.locator('dl')).toContainText('OPA policy');
  await expect(page.locator('#opa-policy')).toContainText(opaPolicyPath);
  await page.getByRole('button', { name: 'Edit organization' }).click();
  await page.getByRole('textbox', { name: 'OPA policy' }).click();
  await page.getByRole('textbox', { name: 'OPA policy' }).fill(`${opaPolicyPath}-edit`);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('dl')).toContainText(organizationName);
  await expect(page.locator('dl')).toContainText(`${opaPolicyPath}-edit`);
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  await expect(page.locator('dl')).toContainText(`${opaPolicyPath}-edit`);
  await deleteOrganization(organizationName, page);
  await assertNoResultsFoundForResource(organizationName, 'contains', page, true);
});

test('organization - create PAC disabled', { tag: ['@mock'] }, async ({ page }) => {
  await mockFeatureFlags(page, { FEATURE_POLICY_AS_CODE_ENABLED: false });
  await navigateTo(page, 'Access Management', 'Organizations');
  await page.getByRole('link', { name: 'Create organization', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'OPA policy' })).not.toBeVisible();
});
