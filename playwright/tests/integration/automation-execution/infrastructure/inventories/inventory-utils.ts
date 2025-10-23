import { Page, expect } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';

export async function createInventory(
  options: {
    name?: string;
    description?: string;
    organizationName?: string;
    labelName?: string;
    instanceGroupName?: string;
    policyEnforcement?: string;
    variables?: string;
    preventInstanceGroupFallback?: boolean;
  },
  page: Page
) {
  const inventoryName = options.name ?? createE2EName('inventory');

  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page
    .getByRole('menuitem', {
      name: 'Create inventory',
    })
    .click();

  await page.getByPlaceholder('Enter inventory name').fill(inventoryName);
  await page.getByPlaceholder('Enter description').fill(options.description ?? '');
  await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);

  // instance group
  if (options.instanceGroupName) {
    await page.getByLabel('Instance groups').click();
    await page.getByLabel('Search input').click();
    await page.getByLabel('Search input').fill(options.instanceGroupName);
    await page.getByLabel(options.instanceGroupName).check();
  }
  // label
  if (options.labelName) {
    await page.getByPlaceholder('Select or create labels').click();
    await page.getByPlaceholder('Select or create labels').fill(options.labelName);
    await page.getByRole('option', { name: `Create "${options.labelName}"` }).click();
  }
  // policy enforcement
  if (options.policyEnforcement) {
    await page.getByLabel('Policy enforcement').click();
    await page.getByLabel('Policy enforcement').fill(options.policyEnforcement);
  }
  // variables
  if (options.variables) {
    await page.locator('.view-line').click();
    await page.getByRole('textbox', { name: 'Editor content' }).fill(options.variables);
  }
  // prevent instance group fallback
  if (options.preventInstanceGroupFallback) {
    await page.getByLabel('Prevent instance group').check();
  }

  // create inventory
  await page.getByRole('button', { name: 'Create inventory' }).click();
  await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
  return inventoryName;
}

export async function createSmartInventory(
  options: {
    name?: string;
    organizationName: string;
    instanceGroupName?: string;
    labelName?: string;
  },
  page: Page
) {
  const inventoryName = options.name ?? createE2EName('inventory');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page
    .getByRole('menuitem', {
      name: 'Create smart inventory',
    })
    .click();

  const smartHostFilterVal = 'name__icontains=RedHat';
  await page.getByPlaceholder('Enter smart host filter').click();
  await page.getByPlaceholder('Enter smart host filter').fill(`${smartHostFilterVal}`);
  // TODO
  return inventoryName;
}

export async function createConstructedInventory(
  options: {
    name?: string;
    organizationName: string;
    instanceGroupName?: string;
    labelName?: string;
  },
  page: Page
) {
  const inventoryName = options.name ?? createE2EName('inventory');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page
    .getByRole('menuitem', {
      name: 'Create constructed inventory',
    })
    .click();

  return inventoryName;
}

export async function createInventorySource(
  options: {
    name?: string;
    projectName?: string;
    organizationName?: string;
  },
  page: Page
) {
  const inventorySourceName = options.name ?? createE2EName('inventory-source');
  const projectName = options.projectName ?? 'Demo Project';
  const inventoryName = await createInventory(
    { organizationName: options.organizationName ?? 'Default' },
    page
  );
  await page.getByRole('tab', { name: 'Sources' }).click();
  await page.getByText('Create source', { exact: true }).click();
  await page.getByPlaceholder('Enter source name').click();
  await page.getByPlaceholder('Enter source name').fill(inventorySourceName);
  await page.getByRole('button', { name: 'Select source' }).click();
  await page.getByRole('option', { name: 'Sourced from a Project' }).click();
  await page.locator('#project-select').click();
  await page.getByRole('option', { name: projectName }).click();
  await page.getByPlaceholder('Select inventory file').click();
  await page.getByRole('option', { name: '/ (project root)' }).click();
  await page.getByRole('button', { name: 'Create source' }).click();
  await expect(page.getByRole('heading', { name: inventorySourceName, exact: true })).toBeVisible();
  return { inventorySourceName, inventoryName };
}

export async function deleteInventory(inventoryName: string, page: Page) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: inventoryName }, page);
  await clickPageAction('Delete inventory', page);
  await confirmAndAssertDeletion(page);
  await expect(page.getByRole('heading', { name: 'Inventories', exact: true })).toBeVisible();
}

export async function deleteInventorySource(
  inventoryName: string,
  inventorySourceName: string,
  page: Page
) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: inventoryName }, page);
  await page.getByRole('tab', { name: 'Sources' }).click();
  await clickTableRow({ text: inventorySourceName }, page);
  await page.getByLabel('kebab dropdown toggle').click();
  await page.getByRole('menuitem', { name: 'Delete inventory source' }).click();
  await confirmAndAssertDeletion(page);
  await expect(
    page.getByRole('heading', { name: 'There are currently no sources added to this inventory.' })
  ).toBeVisible();
}
