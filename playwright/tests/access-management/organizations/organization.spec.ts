import { expect, test } from '@playwright/test';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createOrganization, deleteOrganization } from './organization-utils';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test('organization - create and delete', { tag: [] }, async ({ page }) => {
  const organizationName = await createOrganization(page);
  await deleteOrganization(organizationName, page);
});

test('organization - create/edit', { tag: ['@not_mock'] }, async ({ page }) => {
  const organizationName = createE2EName();
  const opaPolicyPath = 'test/test';
  await navigateTo(page, 'Access Management', 'Organizations');
  await page.getByText('Create organization', { exact: true }).click();

  await page.getByRole('textbox', { name: 'Name' }).fill(organizationName);
  await expect(page.getByRole('textbox', { name: 'Policy enforcement' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Policy enforcement' }).click();
  await page.getByRole('textbox', { name: 'Policy enforcement' }).fill(opaPolicyPath);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('dl')).toContainText('Policy enforcement');
  await expect(page.getByTestId('policy-enforcement')).toContainText(opaPolicyPath);
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  await expect(page.locator('dl')).toContainText('Policy enforcement');
  await expect(page.getByTestId('policy-enforcement')).toContainText(opaPolicyPath);
  await page.getByRole('button', { name: 'Edit organization' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(`${organizationName}-edited`);
  await page.getByRole('textbox', { name: 'Policy enforcement' }).fill(`${opaPolicyPath}-edit`);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('dl')).toContainText(`${organizationName}-edited`);
  await expect(page.locator('dl')).toContainText(`${opaPolicyPath}-edit`);
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(
    page.getByRole('heading', { name: `${organizationName}-edited`, exact: true })
  ).toBeVisible();
  await expect(page.locator('dl')).toContainText(`${opaPolicyPath}-edit`);
  await deleteOrganization(`${organizationName}-edited`, page);
});
