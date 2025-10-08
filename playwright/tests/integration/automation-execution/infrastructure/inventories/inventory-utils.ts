import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../../../commands/clickPageAction';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../../commands/createE2EName';
import { navigateTo } from '../../../../../commands/navigateTo';

export async function createInventory(options: { name?: string; type?: string }, page: Page) {
  const inventoryName = options.name ?? createE2EName('inventory');
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await page.getByLabel('dropdown toggle', { exact: true }).click();
  await page
    .getByRole('menuitem', {
      name: options.type === 'smart' ? 'Create smart inventory' : 'Create inventory',
    })
    .click();
  if (options.type === 'smart') {
    const smartHostFilterVal = 'name__icontains=RedHat';
    await page.getByPlaceholder('Enter smart host filter').click();
    await page.getByPlaceholder('Enter smart host filter').fill(`${smartHostFilterVal}`);
  }
  await page.getByPlaceholder('Enter inventory name').fill(inventoryName);
  await page.getByLabel('Organization *').click();
  await page.getByRole('textbox', { name: 'Search input' }).fill('Default');
  await page.getByRole('option', { name: 'Default' }).click();
  if (options.type !== 'smart') {
    await page.getByLabel('Prevent instance group').check();
  }
  // Re-enable this when we have a deployment with OPA policy enabled.
  // get feature flags from API
  // if( featureflags includes OPA){
  // await page.getByLabel('OPA query path').fill('test/opa');
  // }
  await page.getByRole('button', { name: 'Create inventory' }).click();
  await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
  return inventoryName;
}

export async function createInventorySource(
  options: {
    name?: string;
    projectName?: string;
  },
  page: Page
) {
  const inventorySourceName = options.name ?? createE2EName('inventory-source');
  const projectName = options.projectName ?? 'Demo Project';
  const inventoryName = await createInventory({}, page);
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
