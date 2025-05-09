import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createOrganization, deleteOrganization } from './organization-utils';
import { hasFeatureFlag } from '../../util/featureFlags';
import { navigateTo } from '../../../commands/navigateTo';
import { createE2EName } from '../../../commands/createE2EName';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test('organization - create and delete', { tag: [] }, async ({ page }) => {
  const organizationName = await createOrganization(page);
  await deleteOrganization(organizationName, page);
});

test('organization - create/edit', { tag: ['@not_mock'] }, async ({ page }) => {
  const hasPolicyAsCode = await hasFeatureFlag(page, 'FEATURE_POLICY_AS_CODE_ENABLED');

  const organizationName = createE2EName();
  const opaPolicyPath = 'test/test';
  await navigateTo(page, 'Access Management', 'Organizations');
  await page.getByText('Create organization', { exact: true }).click();

  await page.getByRole('textbox', { name: 'Name' }).fill(organizationName);
  if (hasPolicyAsCode) {
    await expect(page.getByRole('textbox', { name: 'Policy enforcement' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Policy enforcement' }).click();
    await page.getByRole('textbox', { name: 'Policy enforcement' }).fill(opaPolicyPath);
  }
  await page.getByRole('button', { name: 'Next' }).click();
  if (hasPolicyAsCode) {
    await expect(page.locator('dl')).toContainText('Policy enforcement');
    await expect(page.locator('#opa-query-path')).toContainText(opaPolicyPath);
  }
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  if (hasPolicyAsCode) {
    await expect(page.locator('dl')).toContainText('Policy enforcement');
    await expect(page.locator('#opa-query-path')).toContainText(opaPolicyPath);
  }
  await page.getByRole('button', { name: 'Edit organization' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(`${organizationName}-edited`);
  if (hasPolicyAsCode) {
    await page.getByRole('textbox', { name: 'Policy enforcement' }).click();
    await page.getByRole('textbox', { name: 'Policy enforcement' }).fill(`${opaPolicyPath}-edit`);
  }
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('dl')).toContainText(`${organizationName}-edited`);
  if (hasPolicyAsCode) {
    await expect(page.locator('dl')).toContainText(`${opaPolicyPath}-edit`);
  }
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(
    page.getByRole('heading', { name: `${organizationName}-edited`, exact: true })
  ).toBeVisible();
  if (hasPolicyAsCode) {
    await expect(page.locator('dl')).toContainText(`${opaPolicyPath}-edit`);
  }
  await deleteOrganization(`${organizationName}-edited`, page);
});
