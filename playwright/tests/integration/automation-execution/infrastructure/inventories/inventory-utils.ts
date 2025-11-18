import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { Page, expect } from '@playwright/test';

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
    description?: string;
    organizationName: string;
    instanceGroupNames?: string[];
    inputInventoryNames?: string[];
    cacheTimeout?: number;
    verbosity?: string;
    limit?: string;
    sourceVars?: string;
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

  await page.getByPlaceholder('Enter inventory name').fill(inventoryName);
  if (options.description) {
    await page.getByPlaceholder('Enter description').fill(options.description);
  }
  await singleSelectByLabel('Organization', options.organizationName, page);

  // instance groups
  if (options.instanceGroupNames && options.instanceGroupNames.length > 0) {
    await page.getByLabel('Instance groups').click();
    for (const instanceGroupName of options.instanceGroupNames) {
      await page
        .locator('#instance-group-select-search')
        .getByLabel('Search input')
        .fill(instanceGroupName);
      await page.getByLabel(instanceGroupName).check();
    }
  }

  // input inventories
  if (options.inputInventoryNames && options.inputInventoryNames.length > 0) {
    await page.getByLabel('Input inventories').click();
    for (const inventoryName of options.inputInventoryNames) {
      await page.locator('#inventories-search').getByLabel('Search input').fill(inventoryName);
      await page.getByLabel(inventoryName).check();
    }
  }

  // cache timeout
  if (options.cacheTimeout !== undefined) {
    await page.getByLabel('Cache timeout').clear();
    await page.getByLabel('Cache timeout').fill(String(options.cacheTimeout));
  }

  // verbosity
  if (options.verbosity) {
    await page.getByLabel('Verbosity').click();
    await page.getByRole('option', { name: options.verbosity }).click();
  }

  // limit
  if (options.limit) {
    await page.getByLabel('Limit').fill(options.limit);
  }

  // source vars
  if (options.sourceVars) {
    await page.locator('.view-line').click();
    await page.getByRole('textbox', { name: 'Editor content' }).fill(options.sourceVars);
  }

  // label
  if (options.labelName) {
    await page.getByPlaceholder('Select or create labels').click();
    await page.getByPlaceholder('Select or create labels').fill(options.labelName);
    await page.getByRole('option', { name: `Create "${options.labelName}"` }).click();
  }

  // create inventory
  await page.getByRole('button', { name: 'Create inventory' }).click();
  await expect(page.getByRole('heading', { name: inventoryName, exact: true })).toBeVisible();
  return inventoryName;
}

export async function createInventorySource(
  options: {
    name?: string;
    projectName?: string;
    organizationName?: string;
    scheduleName?: string;
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

  if (options.scheduleName) {
    await page.getByRole('tab', { name: 'Schedules' }).click();
    await clickPageAction('Create schedule', page);
    await page.getByPlaceholder('Enter schedule name').fill(options.scheduleName);
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Save rule' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.getByRole('heading')).toContainText(options.scheduleName);
  }

  return { inventorySourceName, inventoryName };
}

async function selectInventoryFile(inventoryFile: string, page: Page) {
  await page.locator('#inventory-file-toggle').click();

  if (inventoryFile === '/ (project root)') {
    await page.getByRole('option', { name: '/ (project root)' }).click();
    return;
  }

  const existingOption = page.getByRole('option', { name: inventoryFile, exact: true });
  const optionExists = (await existingOption.count()) > 0;

  if (optionExists) {
    await existingOption.click();
  } else {
    await page.locator('#inventory-typeahead-select-input input[type="text"]').fill(inventoryFile);
    await page.locator('#select-create-typeahead-CREATE_NEW_VALUE').click();
  }
}

async function fillSourceOptions(
  options: {
    overwrite?: boolean;
    overwriteVars?: boolean;
    updateOnLaunch?: boolean;
    cacheTimeout?: string;
    sourceVariables?: string;
  },
  page: Page
) {
  if (options.overwrite) {
    await page.getByLabel('Overwrite', { exact: true }).check();
  }
  if (options.overwriteVars) {
    await page.getByLabel('Overwrite variables').check();
  }
  if (options.updateOnLaunch) {
    await page.getByLabel('Update on launch').check();
    if (options.cacheTimeout) {
      await page.getByTestId('update-cache-timeout').fill(options.cacheTimeout);
    }
  }
  if (options.sourceVariables) {
    await page.locator('.view-line').click();
    await page.getByRole('textbox', { name: 'Editor content' }).fill(options.sourceVariables);
  }
}

async function createScheduleForSource(scheduleName: string, page: Page) {
  await page.getByRole('tab', { name: 'Schedules' }).click();
  await clickPageAction('Create schedule', page);
  await page.getByPlaceholder('Enter schedule name').fill(scheduleName);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Save rule' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading')).toContainText(scheduleName);
}

export async function createInventorySourceFromProject(
  options: {
    inventoryName: string;
    name?: string;
    description?: string;
    projectName: string;
    inventoryFile?: string;
    executionEnvironmentName?: string;
    credentialName?: string;
    hostFilter?: string;
    verbosity?: string;
    enabledVar?: string;
    enabledValue?: string;
    overwrite?: boolean;
    overwriteVars?: boolean;
    updateOnLaunch?: boolean;
    cacheTimeout?: string;
    sourceVariables?: string;
    scheduleName?: string;
  },
  page: Page
) {
  const inventorySourceName = options.name ?? createE2EName('inventory-source');

  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: options.inventoryName }, page);
  await page.getByRole('tab', { name: 'Sources' }).click();
  await page.getByText('Create source', { exact: true }).click();

  await page.getByPlaceholder('Enter source name').fill(inventorySourceName);

  if (options.description) {
    await page.getByPlaceholder('Enter description').fill(options.description);
  }

  if (options.executionEnvironmentName) {
    await page.getByTestId('execution-environment').click();
    await page.getByRole('option', { name: options.executionEnvironmentName, exact: true }).click();
  }

  await page.getByRole('button', { name: 'Select source' }).click();
  await page.getByRole('option', { name: 'Sourced from a Project' }).click();

  if (options.credentialName) {
    await page.getByTestId('credential').click();
    await page.getByRole('option', { name: options.credentialName, exact: true }).click();
  }

  await page.locator('#project-select').click();
  await page.waitForTimeout(2000);
  await page.getByRole('option', { name: options.projectName }).click();

  await selectInventoryFile(options.inventoryFile ?? '/ (project root)', page);

  if (options.hostFilter) {
    await page.getByTestId('host-filter').fill(options.hostFilter);
  }
  if (options.verbosity) {
    await page.getByTestId('verbosity').click();
    await page.getByRole('option', { name: options.verbosity }).click();
  }
  if (options.enabledVar) {
    await page.getByTestId('enabled-var').fill(options.enabledVar);
  }
  if (options.enabledValue) {
    await page.getByTestId('enabled-value').fill(options.enabledValue);
  }

  await fillSourceOptions(options, page);

  await page.getByRole('button', { name: 'Create source' }).click();
  await expect(page.getByRole('heading', { name: inventorySourceName, exact: true })).toBeVisible();

  if (options.scheduleName) {
    await createScheduleForSource(options.scheduleName, page);
  }

  return inventorySourceName;
}

export async function toggleNotificationForInventorySource(
  options: {
    inventoryName: string;
    inventorySourceName: string;
    notificationName: string;
    notificationType: 'start' | 'success' | 'failure';
  },
  page: Page
) {
  await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
  await clickTableRow({ text: options.inventoryName }, page);
  await page.getByRole('tab', { name: 'Sources' }).click();
  await clickTableRow({ text: options.inventorySourceName }, page);
  await page.getByRole('tab', { name: 'Notifications' }).click();

  await filterTable(
    {
      filterLabel: 'Name',
      filterValue: options.notificationName,
      clearFilters: false,
    },
    page
  );

  const row = page.getByRole('row', { name: options.notificationName });

  let toggleIndex = 0;
  if (options.notificationType === 'success') {
    toggleIndex = 1;
  } else if (options.notificationType === 'failure') {
    toggleIndex = 2;
  }
  await row.locator('label').nth(toggleIndex).click();

  await page.waitForResponse(
    (response) =>
      response.url().includes('notification_templates') &&
      (response.status() === 204 || response.status() === 201)
  );
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
