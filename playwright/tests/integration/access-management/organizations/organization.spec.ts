import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Organization } from '../../../../utils/organization';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test('organization - create and delete', { tag: ['@tier1'] }, async ({ page }) => {
  const organizationName = await Organization.ui.create(page);
  await Organization.ui.delete(page, organizationName);
});

test('organization - create/edit', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
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
  await Organization.ui.delete(page, `${organizationName}-edited`);
});

// Shifted left: Redundant UI path - edit already covered in tier1 via details page
test('edits an organization from the list view', { tag: ['@not_mock'] }, async ({ page }) => {
  // Create organization first
  const organizationName = await Organization.ui.create(page);
  const editedName = `${createE2EName()} from list page`;

  await navigateTo(page, 'Access Management', 'Organizations');

  // Find and edit the organization from list view
  await clickTableRowAction(
    {
      pageTitle: 'Organizations',
      text: organizationName,
      action: 'Edit organization',
    },
    page
  );

  await expect(page.getByRole('heading', { name: `Edit ${organizationName}` })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: editedName, exact: true })).toBeVisible();

  // Clean up
  await Organization.ui.delete(page, editedName);
});

// Shifted left: Redundant UI path - same operation as list view, both covered in tier1 create/edit test
test('edits an organization from the details view', { tag: ['@not_mock'] }, async ({ page }) => {
  // Create organization first
  const organizationName = await Organization.ui.create(page);
  const editedName = `${createE2EName()} from details page`;

  await navigateTo(page, 'Access Management', 'Organizations');
  await clickTableRow({ text: organizationName }, page);

  await expect(page.getByRole('heading', { name: organizationName, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit organization' }).click();

  await expect(page.getByRole('heading', { name: `Edit ${organizationName}` })).toBeVisible();
  await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();

  await expect(page.getByRole('heading', { name: editedName, exact: true })).toBeVisible();

  // Clean up
  await Organization.ui.delete(page, editedName);
});

// Shifted left: Redundant UI path - delete already covered in tier1 via details page
test(
  'deletes an organization from the organizations list view',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    // Create organization first
    const organizationName = await Organization.ui.create(page);

    await navigateTo(page, 'Access Management', 'Organizations');

    // Find and delete the organization from list view
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

// Shifted left: Bulk operation - convenience feature, not core functionality
test(
  'bulk creates and deletes organizations from the organizations list toolbar',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    // Create two organizations first
    const org1Name = await Organization.ui.create(page);
    const org2Name = await Organization.ui.create(page);

    await navigateTo(page, 'Access Management', 'Organizations');

    // Select first organization
    await selectTableRow(
      {
        pageTitle: 'Organizations',
        filterLabel: 'Name',
        filterValue: org1Name,
      },
      page
    );

    // Select second organization
    await selectTableRow(
      {
        pageTitle: 'Organizations',
        filterLabel: 'Name',
        filterValue: org2Name,
        clearFilters: true,
      },
      page
    );

    // Delete both organizations
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete organizations' }).click();

    await confirmAndAssertDeletion(page);
  }
);
