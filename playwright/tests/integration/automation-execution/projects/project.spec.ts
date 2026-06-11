import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { expect, test } from '@playwright/test';
import {
  Organization,
  Team,
  User,
  Inventory,
  JobTemplate,
  Project,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/projects' }));
test.afterEach(setupAfter);

test.describe('Project - Basic Operations', () => {
  test('project - Create, sync, and delete', async ({ page }) => {
    const projectName = await Project.ui.create(page, { organizationName: 'Default' });
    await Project.ui.sync(page, projectName);
    await Project.ui.delete(page, projectName);
  });

  test('project - test user access organization link', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 60 * 1000);
    const organizationName = await Organization.ui.create(page);
    const projectName = await Project.ui.create(page, { organizationName });
    const userName = await User.ui
      .create(page)
      .then((r) => (typeof r === 'string' ? r : r.userName));
    const teamName = await Team.ui.create(page, { organizationName });

    // Assign user to team
    await page.getByRole('tab', { name: 'Users' }).click();
    await page.getByRole('button', { name: 'Assign users' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(userName);
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Assign users' }).click();

    // assign project admin role to team
    await navigateTo(page, 'Automation Execution', 'Projects');
    await clickTableRow({ filterLabel: 'Name', text: projectName }, page);
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
    await page.getByRole('tab', { name: 'Team Access' }).click();
    await page.getByRole('link', { name: 'Assign teams' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(teamName);
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.locator('button', { hasText: 'Next' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Project Admin');
    await page.getByRole('button', { name: 'apply filter' }).click();
    await page.getByRole('checkbox', { name: 'Select row' }).check();
    await page.locator('button', { hasText: 'Next' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();

    // view the project user access role alert
    await page.getByRole('tab', { name: 'User Access' }).click();

    // Wait for the user to appear in the table (indirect access through team)
    await expect(page.getByRole('row', { name: userName })).toBeVisible({ timeout: 60000 });

    await page
      .getByRole('row', { name: userName })
      .getByRole('button', { name: 'Manage roles' })
      .click();
    await expect(page.getByRole('heading', { name: 'Manage roles directly' })).toContainText(
      `Manage roles directly assigned to ${userName} for ${projectName}`
    );
    await expect(page.getByRole('link', { name: organizationName })).toBeVisible();
    await page.getByRole('link', { name: organizationName }).click();
    await expect(page.getByRole('heading', { name: organizationName })).toBeVisible();
    await Project.ui.delete(page, projectName);
    await User.ui.delete(page, userName);
    await Team.ui.delete(page, teamName);
    await Organization.ui.delete(page, organizationName);
  });
});

test.describe('Project - Edit, Copy, and Sync', () => {
  test('Project - Edit project name', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 60 * 1000);
    const projectName = await Project.ui.create(page, { organizationName: 'Default' });
    await Project.ui.sync(page, projectName);
    const editedName = `${projectName} - edited`;

    await navigateTo(page, 'Automation Execution', 'Projects');
    await clickTableRow(
      { text: projectName, filterLabel: 'Name', filterValue: projectName, clearFilters: true },
      page
    );
    await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Edit project' }).click();
    await expect(page.getByRole('heading')).toContainText('Edit');
    await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);
    await page.getByRole('button', { name: 'Save project', exact: true }).click();
    await expect(page.getByRole('heading', { name: editedName, exact: true })).toBeVisible();

    await Project.ui.delete(page, editedName);
  });

  test(
    'Project - Copy from list and details with API interception',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);
      const projectName = await Project.ui.create(page, { organizationName: 'Default' });
      await Project.ui.sync(page, projectName);

      // Copy from list row kebab action
      const copiedName1 = await Project.ui.copy(page, projectName);
      await Project.ui.sync(page, copiedName1);

      // Copy from details page action
      await navigateTo(page, 'Automation Execution', 'Projects');
      await clickTableRow(
        { text: projectName, filterLabel: 'Name', filterValue: projectName, clearFilters: true },
        page
      );
      await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();

      const copyResponsePromise = page.waitForResponse(
        (response) => response.url().includes('/copy/') && response.status() === 201
      );

      await clickPageAction('Duplicate project', page);

      const copyResponse = await copyResponsePromise;
      const responseData: unknown = await copyResponse.json();
      const copiedProject = responseData as { name: string; id: number };
      const copiedName2 = copiedProject.name;

      // Wait for success alert (copy from details stays on current details page)
      await expect(page.getByTestId('alert-toaster')).toContainText('duplicated', {
        timeout: 10000,
      });
      await Project.ui.sync(page, copiedName2);

      // Cleanup
      await Project.ui.delete(page, projectName);
      await Project.ui.delete(page, copiedName1);
      await Project.ui.delete(page, copiedName2);
    }
  );

  test('Project - Sync from list and details', { tag: ['@not_mock'] }, async ({ page }) => {
    test.setTimeout(5 * 60 * 1000);
    const projectName = await Project.ui.create(page, { organizationName: 'Default' });
    await Project.ui.sync(page, projectName);

    // Sync from list row action
    await navigateTo(page, 'Automation Execution', 'Projects');
    await clickTableRowAction(
      { text: projectName, action: 'Sync project', clearFilters: true },
      page
    );
    await expect(page.getByTestId('alert-toaster')).toContainText(`Syncing ${projectName}`);
    await Project.ui.sync(page, projectName);

    // Sync from details page
    await clickTableRow(
      { text: projectName, filterLabel: 'Name', filterValue: projectName, clearFilters: true },
      page
    );
    await expect(page.getByRole('heading', { name: projectName, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Sync project' }).click();
    await Project.ui.sync(page, projectName);

    await Project.ui.delete(page, projectName);
  });
});

test.describe('Project - Job Templates', () => {
  test(
    'Project - Associate with job template and view on templates tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      // Create project and inventory
      const projectName1 = await Project.ui.create(page, { organizationName: 'Default' });
      await Project.ui.sync(page, projectName1);
      const projectName2 = await Project.ui.create(page, { organizationName: 'Default' });
      await Project.ui.sync(page, projectName2);
      const inventoryName = await Inventory.ui.create(page);

      // Navigate to templates page to clear any stale project page state
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.waitForTimeout(3000);

      // Create job template with first project
      const jobTemplateName = await JobTemplate.ui.create(page, {
        inventoryName,
        projectName: projectName1,
      });

      // Edit job template to use second project
      await navigateTo(page, 'Automation Execution', 'Templates');
      await clickTableRow(
        {
          text: jobTemplateName,
          filterLabel: 'Name',
          filterValue: jobTemplateName,
          clearFilters: true,
        },
        page
      );
      await page.getByRole('link', { name: 'Edit template' }).click();
      await expect(page.getByRole('heading')).toContainText('Edit');

      // Change project
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName2 }).click();
      await page.waitForTimeout(1000);

      // After changing project, playbook might get cleared, so select one
      await page.getByPlaceholder('Add a project, then select a').click();
      await page.getByPlaceholder('Add a project, then select a').fill('hello');
      await page.getByRole('option', { name: 'hello_world.yml' }).click();

      await page.getByRole('button', { name: 'Save job template', exact: true }).click();
      await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();

      // Launch job template
      await page.getByRole('button', { name: 'Launch template' }).click();
      await expect(page.getByRole('heading', { name: jobTemplateName })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Relaunch job' })).toBeVisible({
        timeout: 60000,
      });

      // View from project's Job Templates tab
      await navigateTo(page, 'Automation Execution', 'Projects');
      // Use inline table row click (multiple projects may exist with similar names)
      await filterTable(
        { filterLabel: 'Name', filterValue: projectName2, clearFilters: true },
        page
      );
      await expect(page.locator('tbody')).toBeVisible({ timeout: 5000 });
      await page
        .getByRole('row', { name: projectName2 })
        .getByRole('link', { name: projectName2 })
        .click();
      await expect(page.getByRole('heading', { name: projectName2, exact: true })).toBeVisible();
      await page.getByRole('tab', { name: 'Job Templates' }).click();
      await expect(page).toHaveURL(/\/projects\/\d+\/job-templates/);
      await filterTable(
        { filterLabel: 'Name', filterValue: jobTemplateName, clearFilters: true },
        page
      );
      await expect(page.getByRole('link', { name: jobTemplateName })).toBeVisible();

      // Cleanup
      await JobTemplate.ui.delete(page, jobTemplateName);
      await Inventory.ui.delete(page, inventoryName);
      await Project.ui.delete(page, projectName1);
      await Project.ui.delete(page, projectName2);
    }
  );
});
