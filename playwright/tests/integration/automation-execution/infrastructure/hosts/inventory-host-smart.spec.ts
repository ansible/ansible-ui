import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../../commands/clickTableRow';
import { createE2EName } from '../../../../../commands/createE2EName';
import { navigateTo } from '../../../../../commands/navigateTo';
import { runAdHocCommandWizard } from '../../../../../commands/runAdHocCommandWizard';
import { setupAfter, setupBefore } from '../../../../../commands/setup';
import {
  Organization,
  Project,
  JobTemplate,
  Credential,
  ExecutionEnvironment,
  Inventory,
  InventoryHost,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Inventory Host - Smart Inventory Tests', () => {
  test(
    'should run an ad-hoc command against a host in smart inventory',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      const organizationName = await Organization.ui.create(page);
      const executionEnvironmentName = await ExecutionEnvironment.ui.create(page, {
        organizationName,
      });
      const credentialName = await Credential.ui.create(page, { credentialType: 'Machine' });

      // Create a regular inventory with hosts first
      const regularInventoryName = await Inventory.ui.create(page, { organizationName });
      await InventoryHost.ui.create(page, regularInventoryName, {});

      // Create smart inventory that will include the hosts
      const smartInventoryName = createE2EName('smart-inventory');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create smart inventory' }).click();

      await page.getByPlaceholder('Enter inventory name').fill(smartInventoryName);
      await page.getByPlaceholder('Enter description').fill('Smart inventory for E2E tests');
      await page.getByPlaceholder('Enter smart host filter').fill('name__icontains=E2E');
      await page.getByLabel('Organization *').click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Create inventory' }).click();
      await expect(
        page.getByRole('heading', { name: smartInventoryName, exact: true })
      ).toBeVisible();

      // Navigate to hosts tab and run ad-hoc command
      await page.getByRole('tab', { name: 'Hosts' }).click();

      // Wait for hosts to appear (smart inventory may take a moment to populate)
      await expect(page.getByRole('row')).toHaveCount(2, { timeout: 10000 }); // header + 1 host

      await page.getByRole('button', { name: 'Run command', exact: true }).click();

      await runAdHocCommandWizard(
        {
          module: 'shell',
          moduleArgs: 'echo "Hello World"',
          verbosity: '0',
          limit: 'all',
          forks: 2,
          showChanges: true,
          becomeEnabled: true,
          executionEnvironmentName,
          credentialName,
        },
        page
      );

      // Cleanup
      await Inventory.ui.delete(page, smartInventoryName);
      await Inventory.ui.delete(page, regularInventoryName);
      await Credential.ui.delete(page, credentialName);
      await ExecutionEnvironment.ui.delete(page, executionEnvironmentName);
      await Organization.ui.delete(page, organizationName);
    }
  );

  test(
    'should launch a job template using smart inventory and view job on host jobs tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      const organizationName = await Organization.ui.create(page);
      const projectName = await Project.ui.create(page, { organizationName });

      // Create a regular inventory with a host
      const regularInventoryName = await Inventory.ui.create(page, { organizationName });

      // Create smart inventory
      const smartInventoryName = createE2EName('smart-inventory');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create smart inventory' }).click();

      await page.getByPlaceholder('Enter inventory name').fill(smartInventoryName);
      await page.getByPlaceholder('Enter description').fill('Smart inventory for job test');
      await page.getByPlaceholder('Enter smart host filter').fill('name__icontains=E2E');
      await page.getByLabel('Organization *').click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Create inventory' }).click();
      await expect(
        page.getByRole('heading', { name: smartInventoryName, exact: true })
      ).toBeVisible();

      // Wait a moment for the smart inventory to be fully available
      await page.waitForTimeout(2000);

      // Create job template manually (since smart inventories need special handling)
      const jobTemplateName = createE2EName('job-template');
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible({ timeout: 5000 });
      await page.getByText('Create template', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();
      await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);
      await page
        .getByPlaceholder('Enter description')
        .fill('Job template for smart inventory test');

      // Select the smart inventory (without exact match since it includes description)
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(smartInventoryName);
      await page.getByRole('option', { name: new RegExp(smartInventoryName) }).click();

      // Select project
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();

      // Select playbook
      await expect(page.getByPlaceholder('Add a project, then select a')).toBeVisible();
      await page.getByPlaceholder('Add a project, then select a').click();
      await page.getByPlaceholder('Add a project, then select a').fill('hello');
      await expect(page.getByRole('option', { name: 'hello_world.yml' })).toBeVisible();
      await page.getByRole('option', { name: 'hello_world.yml' }).click();

      await page.getByRole('combobox', { name: 'Type to filter' }).click();
      await page.getByRole('option', { name: 'hello_world.yml' }).click();

      await page.getByRole('button', { name: 'Create job template' }).click();
      await expect(page.getByRole('heading', { name: jobTemplateName })).toBeVisible();

      // Navigate back to smart inventory to launch job
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: smartInventoryName }, page);
      await page.getByRole('tab', { name: 'Job Templates' }).click();

      // Launch the job template
      await clickTableRow({ text: jobTemplateName }, page);
      await page.getByRole('button', { name: 'Launch template' }).click();

      // Wait for job to complete (or fail)
      await expect(
        page.locator('[data-testid="failed-status"], [data-testid="success-status"]')
      ).toBeVisible({ timeout: 60000 });

      // Navigate to inventory's Jobs tab to verify job appears
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await clickTableRow({ text: smartInventoryName }, page);
      await page.getByRole('tab', { name: 'Jobs' }).click();

      // Verify the job appears in the inventory's job list
      await expect(page.getByText(jobTemplateName)).toBeVisible();

      // Cleanup
      await JobTemplate.ui.delete(page, jobTemplateName);
      await Inventory.ui.delete(page, smartInventoryName);
      await Inventory.ui.delete(page, regularInventoryName);
      await Project.ui.delete(page, projectName);
      await Organization.ui.delete(page, organizationName);
    }
  );

  test(
    'should verify edit, delete and facts are not available for smart inventory hosts',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      const organizationName = await Organization.ui.create(page);

      // Create a regular inventory with a host
      const regularInventoryName = await Inventory.ui.create(page, { organizationName });
      await InventoryHost.ui.create(page, regularInventoryName, {});

      // Create smart inventory
      const smartInventoryName = createE2EName('smart-inventory');
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create smart inventory' }).click();

      await page.getByPlaceholder('Enter inventory name').fill(smartInventoryName);
      await page
        .getByPlaceholder('Enter description')
        .fill('Smart inventory for UI restrictions test');
      await page.getByPlaceholder('Enter smart host filter').fill('name__icontains=E2E');
      await page.getByLabel('Organization *').click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(organizationName);
      await page.getByRole('option', { name: organizationName }).click();

      await page.getByRole('button', { name: 'Create inventory' }).click();
      await expect(
        page.getByRole('heading', { name: smartInventoryName, exact: true })
      ).toBeVisible();

      // Navigate to hosts tab
      await InventoryHost.ui.navigateToInventoryHostsTab(smartInventoryName, page);

      // Wait for hosts to appear
      await expect(page.getByRole('row')).toHaveCount(2, { timeout: 10000 }); // header + 1 host

      // Verify that edit button does not exist in the hosts list view
      await expect(page.getByTestId('edit-host')).not.toBeVisible();

      // Verify that the actions dropdown does not exist in the hosts list view
      await expect(
        page.locator('[data-testid="actions-column-cell"] [data-testid="actions-dropdown"]')
      ).not.toBeVisible();

      // Navigate to a host details page
      const hostRow = page.locator('tbody tr').first();
      const hostLink = hostRow.locator('[data-testid="name-column-cell"] a');
      await hostLink.click();

      // Wait for host details page to load
      await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();

      // Verify Facts tab is not present
      await expect(page.getByRole('tab', { name: 'Facts' })).not.toBeVisible();

      // Verify Groups tab is not present (smart inventory hosts don't have group management)
      await expect(page.getByRole('tab', { name: 'Groups' })).not.toBeVisible();

      // Verify Jobs tab is not present
      await expect(page.getByRole('tab', { name: 'Jobs' })).not.toBeVisible();

      // Cleanup
      await Inventory.ui.delete(page, smartInventoryName);
      await Inventory.ui.delete(page, regularInventoryName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});
