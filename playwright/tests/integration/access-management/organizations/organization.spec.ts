import { expect, test } from '@playwright/test';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization } from '../../../../utils/organization';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test(
  'should create an organization with policy enforcement, edit it, and delete it',
  { tag: ['@not_mock', '@tier1'] },
  async ({ page }) => {
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
    await expect(
      page.getByRole('heading', {
        name: 'Info alert: New organizations can take up to 15 minutes to propagate across the system.',
      })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
    await expect(page.locator('dl')).toContainText('Policy enforcement');
    await expect(page.getByTestId('policy-enforcement')).toContainText(opaPolicyPath);

    const editedName = `${organizationName}-edited`;
    const editedPolicy = `${opaPolicyPath}-edit`;

    await page.getByRole('button', { name: 'Edit organization' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(editedName);
    await page.getByRole('textbox', { name: 'Policy enforcement' }).fill(editedPolicy);
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.locator('dl')).toContainText(editedName);
    await expect(page.locator('dl')).toContainText(editedPolicy);

    const gatewayPatchPromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().includes('/api/gateway/v1/organizations/') &&
        response.ok()
    );
    const controllerPatchPromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().includes('/api/controller/v2/organizations/') &&
        response.ok()
    );
    await page.getByRole('button', { name: 'Finish' }).click();
    await Promise.all([gatewayPatchPromise, controllerPatchPromise]);

    await expect(page.getByRole('heading', { name: editedName, exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('policy-enforcement')).toContainText(editedPolicy, {
      timeout: 10_000,
    });
    await Organization.ui.delete(page, editedName);
  }
);

test(
  'should delete an organization from the list view',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const organizationName = await Organization.ui.create(page);

    await navigateTo(page, 'Access Management', 'Organizations');

    await clickTableRowAction(
      {
        pageTitle: 'Organizations',
        text: organizationName,
        action: 'Delete organization',
        inKebab: true,
      },
      page
    );

    await confirmAndAssertDeletion(page);
  }
);

test(
  'should bulk create and delete organizations from the list toolbar',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const org1Name = await Organization.ui.create(page);
    const org2Name = await Organization.ui.create(page);

    await navigateTo(page, 'Access Management', 'Organizations');

    await selectTableRow(
      {
        pageTitle: 'Organizations',
        filterLabel: 'Name',
        filterValue: org1Name,
      },
      page
    );

    await selectTableRow(
      {
        pageTitle: 'Organizations',
        filterLabel: 'Name',
        filterValue: org2Name,
        clearFilters: true,
      },
      page
    );

    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete organizations' }).click();

    await confirmAndAssertDeletion(page);
  }
);
