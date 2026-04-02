import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { navigateTo } from '../../../../commands/navigateTo';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { Organization, JobTemplate, Inventory, Project } from '@ansible/playwright/utils';
import { clickTableRowAction } from '../../../../commands/clickTableRowAction';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { selectTableRow } from '../../../../commands/selectTableRow';
import { clickPageAction } from '../../../../commands/clickPageAction';

test.beforeEach(setupBefore({ path: '/execution/jobs' }));
test.afterEach(setupAfter);

test.describe('Jobs: Relaunch', () => {
  let organizationName: string;
  let inventoryName: string;
  let jobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page);
    jobTemplateName = await JobTemplate.ui.create(page, { inventoryName });
  });

  test.afterEach(async ({ page }) => {
    // Use API-based deletion to properly cancel running jobs before cleanup
    try {
      await JobTemplate.api.deleteByName(page, jobTemplateName);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Inventory.ui.delete(page, inventoryName);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Organization.ui.delete(page, organizationName);
    } catch {
      // Ignore cleanup errors
    }
  });

  test(
    'can relaunch the job and navigate to job output',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      await JobTemplate.ui.run(page, jobTemplateName, { inventoryName, doNotWait: true });
      await navigateTo(page, 'Automation Execution', 'Jobs');

      await clickTableRowAction(
        { pageTitle: 'Jobs', text: jobTemplateName, action: 'Relaunch job' },
        page
      );

      // Verify navigated to job output page
      await expect(page).toHaveURL(/\/jobs\/playbook\/\d+\/output/);
      await expect(page.getByText('Success', { exact: true }).first()).toBeVisible({
        timeout: 120000,
      });
    }
  );
});

test.describe('Jobs: Delete', () => {
  let organizationName: string;
  let inventoryName: string;
  let jobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page);
    jobTemplateName = await JobTemplate.ui.create(page, { inventoryName });
  });

  test.afterEach(async ({ page }) => {
    // Use API-based deletion to properly cancel running jobs before cleanup
    try {
      await JobTemplate.api.deleteByName(page, jobTemplateName);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Inventory.ui.delete(page, inventoryName);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await Organization.ui.delete(page, organizationName);
    } catch {
      // Ignore cleanup errors
    }
  });

  test('can delete a job from the jobs list row', { tag: ['@not_mock'] }, async ({ page }) => {
    // Launch a job first
    await JobTemplate.ui.run(page, jobTemplateName, { inventoryName, doNotWait: false });

    // Navigate to jobs list
    await navigateTo(page, 'Automation Execution', 'Jobs');

    // Click kebab menu and delete
    await clickTableRowAction(
      {
        pageTitle: 'Jobs',
        text: jobTemplateName,
        action: 'Delete job',
        inKebab: true,
      },
      page
    );

    // Confirm deletion
    await confirmAndAssertDeletion(page);

    // Verify job is removed from the list - it should no longer appear
    await expect(page.getByRole('row', { name: jobTemplateName })).not.toBeVisible();
  });

  test('can delete a job from the jobs list toolbar', { tag: ['@not_mock'] }, async ({ page }) => {
    // Launch a job first
    await JobTemplate.ui.run(page, jobTemplateName, { inventoryName, doNotWait: false });

    await navigateTo(page, 'Automation Execution', 'Jobs');

    await selectTableRow({ filterLabel: 'Name', filterValue: jobTemplateName }, page);

    // Delete from toolbar
    await page.getByRole('button', { name: 'toolbar actions' }).click();
    await page.getByRole('menuitem', { name: 'Delete jobs' }).click();

    // Confirm deletion
    await confirmAndAssertDeletion(page);

    // Verify job is removed from the list - it should no longer appear
    await expect(page.getByRole('row', { name: jobTemplateName })).not.toBeVisible();
  });
});

test.describe('Jobs: Launch and Verify Output', () => {
  test(
    'can launch a Management job, let it finish, and assert expected results on the output screen',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Administration', 'Management Jobs');
      await clickTableRowAction(
        {
          pageTitle: 'Management Jobs',
          text: 'Cleanup Expired Sessions',
          action: 'Launch management job',
        },
        page
      );

      // Launch the job
      await page.getByRole('button', { name: 'Launch management job' }).click();

      // Wait for navigation to job output
      await expect(page).toHaveURL(/\/jobs\/management\/\d+\/output/);
      await expect(
        page.getByRole('main').getByRole('heading', { name: 'Cleanup Expired Sessions' }).first()
      ).toBeVisible();

      // Wait for job to complete (check job status indicator)
      await expect(page.getByText('Success', { exact: true }).first()).toBeVisible({
        timeout: 120000,
      });
    }
  );

  test(
    'can launch a Source Control Update job, let it finish, and assert expected results on the output screen',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const organizationName = await Organization.ui.create(page);
      const projectName = await Project.ui.create(page, { organizationName });
      // This command waits for the project to be synced upon creation
      await Project.ui.sync(page, projectName);

      await navigateTo(page, 'Automation Execution', 'Projects');
      await clickTableRow(
        {
          text: projectName,
          filterValue: projectName,
          clearFilters: true,
          pageTitle: 'Projects',
        },
        page
      );

      await clickPageAction('Sync project', page);
      await expect(page.locator('#last-job-status')).toBeVisible();
      await page.locator('#last-job-status').getByRole('link').first().click();

      // Verify we're on the job output page
      await expect(page).toHaveURL(/\/jobs\/project\/\d+\/output/);
      await expect(
        page.getByRole('main').getByRole('heading', { name: projectName }).first()
      ).toBeVisible();

      // Wait for job to complete
      await expect(page.getByText('Success', { exact: true }).first()).toBeVisible({
        timeout: 120000,
      });

      // Cleanup
      await Project.ui.delete(page, projectName);
      await Organization.ui.delete(page, organizationName);
    }
  );

  test(
    'can launch a Playbook Run job, let it finish, and assert expected results on the output screen',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const organizationName = await Organization.ui.create(page);
      const inventoryName = await Inventory.ui.create(page);
      const jobTemplateName = await JobTemplate.ui.create(page, { inventoryName });

      // Launch the job template
      await JobTemplate.ui.run(page, jobTemplateName, { inventoryName, doNotWait: false });

      // Navigate to Details tab
      await page.getByRole('tab', { name: 'Details' }).click();
      await expect(page).toHaveURL(/\/jobs\/playbook\/\d+\/details/);
      await expect(page.locator('#name')).toContainText(jobTemplateName);
      await expect(page.locator('#status')).toContainText('Success');
      await expect(page.locator('#inventory')).toContainText(inventoryName);

      // Cleanup
      await JobTemplate.ui.delete(page, jobTemplateName);
      await Inventory.ui.delete(page, inventoryName);
      await Organization.ui.delete(page, organizationName);
    }
  );

  test(
    'can launch an Inventory Sync job, let it finish, and assert expected results on the output screen',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const organizationName = await Organization.ui.create(page);
      const projectName = await Project.ui.create(page, { organizationName });

      // Wait for project to sync before creating inventory source
      await Project.ui.sync(page, projectName);

      const { inventorySourceName, inventoryName } = await Inventory.ui.createSource(page, {
        projectName,
      });

      await clickPageAction('Sync inventory source', page);

      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Inventories');

      await clickTableRow({ text: inventoryName }, page);

      await page.getByRole('tab', { name: 'Jobs' }).click();

      await clickTableRow({ text: `${inventoryName} - ${inventorySourceName}` }, page);

      await expect(page).toHaveURL(/\/jobs\/inventory\/\d+\/details/);

      // Wait for job to complete
      await expect(page.getByText('Success', { exact: true }).first()).toBeVisible({
        timeout: 120000,
      });
      // Cleanup
      await Inventory.ui.deleteSource(page, inventoryName, inventorySourceName);
      await Inventory.ui.delete(page, inventoryName);
      await Project.ui.delete(page, projectName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});
