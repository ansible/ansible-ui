import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { platformUI } from '@ansible/playwright/commands/login';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { WorkflowJobTemplate as WorkflowJobTemplateType } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import {
  Organization,
  Inventory,
  WorkflowJobTemplate,
  Project,
  JobTemplate,
  WorkflowVisualizer,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);
test.setTimeout(3 * 60 * 1000);

test.describe('Workflow Job Templates: Create', () => {
  let organizationName: string;
  let inventoryName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page, { organizationName });
    // Navigate back to templates page after creating resources
    await navigateTo(page, 'Automation Execution', 'Templates');
  });

  test.afterEach(async ({ page }) => {
    await Inventory.ui.delete(page, inventoryName);
    await Organization.ui.delete(page, organizationName);
  });

  test(
    'can create a WFJT with only a name and then edit it to add all optional fields',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const wfjtName = createE2EName('workflow-job-template');

      // setupBefore already navigates to /execution/templates
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();

      // Navigate directly to create page
      const platformUIWithoutSlash = platformUI.endsWith('/')
        ? platformUI.slice(0, -1)
        : platformUI;
      await page.goto(`${platformUIWithoutSlash}/execution/templates/workflow-job-template/create`);

      // Set up API interception for creation
      const createResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/workflow_job_templates/') &&
          response.status() === 201 &&
          response.request().method() === 'POST'
      );

      // Create with only name
      await page.getByTestId('name').fill(wfjtName);
      await page.getByTestId('Submit').click();

      const createResponse = await createResponsePromise;
      const createdWfjt = (await createResponse.json()) as WorkflowJobTemplateType;

      // Verify we're in the visualizer
      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();

      // Navigate back to templates list
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();

      // Edit the workflow job template
      await clickTableRow({ text: createdWfjt.name, clearFilters: true }, page);
      await page.getByRole('link', { name: 'Edit template' }).click();

      // Wait for edit page
      await expect(page.getByRole('heading', { name: `Edit ${createdWfjt.name}` })).toBeVisible();

      // Add optional fields
      await page.getByTestId('description').fill('this is a new description');
      await singleSelectByLabel('Organization', organizationName, page);
      await singleSelectByLabel('Inventory', inventoryName, page);
      await page.getByTestId('limit').fill('mock-limit');
      await page.getByTestId('scm-branch').fill('mock-scm-branch');

      // Add job tags
      await page.getByPlaceholder('Select or create job tags').fill('test job tag');
      await page.getByRole('option', { name: 'Create "test job tag"' }).click();

      // Add skip tags
      await page.getByPlaceholder('Select or create skip tags').fill('test skip tag');
      await page.getByRole('option', { name: 'Create "test skip tag"' }).click();

      // Set up API interception for edit
      const editResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes(`/workflow_job_templates/${createdWfjt.id}/`) &&
          response.request().method() === 'PATCH'
      );

      // Save changes
      await page.getByRole('button', { name: 'Save workflow job template' }).click();

      // Verify we're on the details page
      await expect(
        page.getByRole('heading', { name: createdWfjt.name, exact: true })
      ).toBeVisible();

      // Wait for edit response and verify changes
      const editResponse = await editResponsePromise;
      const editedWfjt = (await editResponse.json()) as WorkflowJobTemplateType;

      expect(editedWfjt.description).toContain('this is a new description');
      expect(editedWfjt.limit).toContain('mock-limit');
      expect(editedWfjt.scm_branch).toContain('mock-scm-branch');

      // Verify details are visible on the page
      await expect(page.getByTestId('description')).toContainText('this is a new description');

      // Cleanup
      await WorkflowJobTemplate.ui.delete(page, createdWfjt.name);
    }
  );

  test(
    'can create a workflow job template using all optional fields',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const wfjtName = createE2EName('workflow-job-template');

      // setupBefore already navigates to /execution/templates
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();

      // Navigate directly to create page
      const platformUIWithoutSlash = platformUI.endsWith('/')
        ? platformUI.slice(0, -1)
        : platformUI;
      await page.goto(`${platformUIWithoutSlash}/execution/templates/workflow-job-template/create`);

      // Set up API interception
      const createResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/workflow_job_templates/') &&
          response.status() === 201 &&
          response.request().method() === 'POST'
      );

      // Fill in all fields
      await page.getByTestId('name').fill(wfjtName);
      await page.getByTestId('description').fill('this is a description');
      await singleSelectByLabel('Organization', organizationName, page);
      await singleSelectByLabel('Inventory', inventoryName, page);
      await page.getByTestId('limit').fill('mock-limit');
      await page.getByTestId('scm-branch').fill('mock-scm-branch');

      // Add job tags
      await page.getByPlaceholder('Select or create job tags').fill('test job tag');
      await page.getByRole('option', { name: 'Create "test job tag"' }).click();

      // Add skip tags
      await page.getByPlaceholder('Select or create skip tags').fill('test skip tag');
      await page.getByRole('option', { name: 'Create "test skip tag"' }).click();

      // Submit
      await page.getByTestId('Submit').click();

      const createResponse = await createResponsePromise;
      const createdWfjt = (await createResponse.json()) as WorkflowJobTemplateType;

      // Verify we're in the visualizer
      await expect(page.getByRole('heading', { name: 'Workflow Visualizer' })).toBeVisible();

      // Cleanup
      await WorkflowJobTemplate.ui.delete(page, createdWfjt.name);
    }
  );
});

test.describe('Workflow Job Templates: Edit', () => {
  let organizationName: string;
  let newOrganizationName: string;
  let inventoryName: string;
  let workflowJobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    newOrganizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page, { organizationName });
    // Navigate back to templates page after creating resources
    await navigateTo(page, 'Automation Execution', 'Templates');

    // Create a workflow job template to edit
    const result = await WorkflowJobTemplate.ui.create(page, {
      organizationName,
      inventoryName,
    });
    workflowJobTemplateName = result.name;
  });

  test.afterEach(async ({ page }) => {
    await WorkflowJobTemplate.ui.delete(page, workflowJobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
    await Organization.ui.delete(page, newOrganizationName);
    await Organization.ui.delete(page, organizationName);
  });

  test(
    'can edit a workflow job template from the details view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const newName = `${workflowJobTemplateName} edited`;

      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
      await clickTableRow({ text: workflowJobTemplateName, clearFilters: true }, page);

      // Verify we're on the details page
      await expect(
        page.getByRole('heading', { name: workflowJobTemplateName, exact: true })
      ).toBeVisible();

      // Click edit link
      await page.getByRole('link', { name: 'Edit template' }).click();

      // Verify we're on the edit page
      await expect(
        page.getByRole('heading', { name: `Edit ${workflowJobTemplateName}` })
      ).toBeVisible();

      // Make edits
      await page.getByTestId('name').clear();
      await page.getByTestId('name').fill(newName);
      await page.getByTestId('description').fill('this is a new description');
      await singleSelectByLabel('Organization', newOrganizationName, page);

      // Save
      await page.getByRole('button', { name: 'Save workflow job template' }).click();

      // Verify we're back on details page with new name
      await expect(page.getByRole('heading', { name: newName, exact: true })).toBeVisible();
      await expect(page.getByTestId('name')).toContainText(newName);
      await expect(page.getByTestId('description')).toContainText('this is a new description');

      // Update the name for cleanup
      workflowJobTemplateName = newName;
    }
  );

  test(
    'can edit a workflow job template from the list row',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const newName = `${workflowJobTemplateName} edited`;

      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();

      // Click edit from row kebab using clickTableRowAction
      await clickTableRowAction(
        {
          text: workflowJobTemplateName,
          action: 'Edit template',
          inKebab: true,
        },
        page
      );

      // Verify we're on the edit page
      await expect(
        page.getByRole('heading', { name: `Edit ${workflowJobTemplateName}` })
      ).toBeVisible();

      // Make edits
      await page.getByTestId('name').clear();
      await page.getByTestId('name').fill(newName);
      await page.getByTestId('description').fill('this is a new description');
      await singleSelectByLabel('Organization', newOrganizationName, page);

      // Save
      await page.getByRole('button', { name: 'Save workflow job template' }).click();

      // Verify
      await expect(page.getByRole('heading', { name: newName, exact: true })).toBeVisible();
      await expect(page.getByTestId('name')).toContainText(newName);
      await expect(page.getByTestId('description')).toContainText('this is a new description');

      // Update the name for cleanup
      workflowJobTemplateName = newName;
    }
  );
});

test.describe('Workflow Job Templates: Copy', () => {
  let organizationName: string;
  let inventoryName: string;
  let workflowJobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page, { organizationName });
    // Navigate back to templates page after creating resources
    await navigateTo(page, 'Automation Execution', 'Templates');

    // Create a workflow job template to copy
    const result = await WorkflowJobTemplate.ui.create(page, {
      organizationName,
      inventoryName,
    });
    workflowJobTemplateName = result.name;
  });

  test.afterEach(async ({ page }) => {
    await WorkflowJobTemplate.ui.delete(page, workflowJobTemplateName);
    await Inventory.ui.delete(page, inventoryName);
    await Organization.ui.delete(page, organizationName);
  });

  test(
    'can duplicate an existing workflow job template from the list',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Close the visualizer from beforeEach
      await page.getByTestId('workflow-visualizer-toolbar-close').click();

      // Use the copyWorkflowJobTemplate utility which handles duplication and returns the copied name
      const copiedWorkflowJobTemplateName = await WorkflowJobTemplate.ui.copy(
        page,
        workflowJobTemplateName
      );

      // Verify the copied template exists
      await navigateTo(page, 'Automation Execution', 'Templates');
      await filterTable(
        { filterLabel: 'Name', filterValue: copiedWorkflowJobTemplateName, clearFilters: true },
        page
      );
      await expect(
        page.getByRole('link', { name: copiedWorkflowJobTemplateName, exact: true })
      ).toBeVisible();

      // Delete the copied template
      await WorkflowJobTemplate.ui.delete(page, copiedWorkflowJobTemplateName);

      // Verify we're back on the templates list
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
    }
  );

  test(
    'can duplicate an existing workflow job template from the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Close the visualizer from beforeEach - this navigates to the details page
      await page.getByTestId('workflow-visualizer-toolbar-close').click();

      // Wait for details page to load
      await expect(
        page.getByRole('heading', { name: workflowJobTemplateName, exact: true })
      ).toBeVisible();

      // Set up API interception for copy
      const copyResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/workflow_job_templates/') &&
          response.url().includes('/copy/') &&
          response.status() === 201
      );

      // Click duplicate from kebab dropdown
      await page.getByLabel('kebab dropdown toggle').click();
      await page.waitForTimeout(1000);
      await page.getByRole('menuitem', { name: 'Duplicate template' }).click();

      // Get the copied workflow job template from the API response
      const copyResponse = await copyResponsePromise;
      const copiedWfjt = (await copyResponse.json()) as WorkflowJobTemplateType;
      expect(copyResponse.status()).toBe(201);

      // Verify the copied template exists
      await navigateTo(page, 'Automation Execution', 'Templates');
      await filterTable(
        { filterLabel: 'Name', filterValue: copiedWfjt.name, clearFilters: true },
        page
      );
      await expect(page.getByRole('link', { name: copiedWfjt.name, exact: true })).toBeVisible();

      // Delete the copied template
      await WorkflowJobTemplate.ui.delete(page, copiedWfjt.name);

      // Verify we're back on the templates list
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
    }
  );
});

test.describe('Workflow Job Templates: Delete', () => {
  let organizationName: string;
  let inventoryName: string;
  let workflowJobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page, { organizationName });
    // Navigate back to templates page after creating resources
    await navigateTo(page, 'Automation Execution', 'Templates');

    // Create a workflow job template to delete
    const result = await WorkflowJobTemplate.ui.create(page, {
      organizationName,
      inventoryName,
    });
    workflowJobTemplateName = result.name;

    // Close the visualizer to get back to a clean state
    await page.getByTestId('workflow-visualizer-toolbar-close').click();

    // Wait for navigation to details page after closing visualizer
    await expect(
      page.getByRole('heading', { name: workflowJobTemplateName, exact: true })
    ).toBeVisible();

    // Navigate back to templates list to ensure clean state for tests
    await navigateTo(page, 'Automation Execution', 'Templates');
  });

  test.afterEach(async ({ page }) => {
    await Inventory.ui.delete(page, inventoryName);
    await Organization.ui.delete(page, organizationName);
  });

  test(
    'can delete a workflow job template from the details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Use the utility function which properly handles deletion
      await WorkflowJobTemplate.ui.delete(page, workflowJobTemplateName);

      // Verify we're back on templates list (no cleanup needed as template is deleted)
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
    }
  );

  test(
    'can delete a workflow job template from the list row',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplateName }, page);

      // Click delete from kebab menu
      await clickTableRowAction(
        {
          text: workflowJobTemplateName,
          action: 'Delete template',
          inKebab: true,
        },
        page
      );

      // Use the robust confirmation utility
      await confirmAndAssertDeletion(page);

      // Verify we're back on templates list (no cleanup needed as template is deleted)
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
    }
  );

  test(
    'can bulk delete multiple workflow job templates from the list toolbar',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Create a second workflow job template
      const result2 = await WorkflowJobTemplate.ui.create(page, {
        organizationName,
        inventoryName,
      });
      const workflowJobTemplate2Name = result2.name;

      // Close the visualizer from creating the second template
      await page.getByTestId('workflow-visualizer-toolbar-close').click();

      // Wait for navigation to details page after closing visualizer
      await expect(
        page.getByRole('heading', { name: workflowJobTemplate2Name, exact: true })
      ).toBeVisible();

      await navigateTo(page, 'Automation Execution', 'Templates');

      // Select first template by filtering and checking
      await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplateName }, page);
      await page.getByRole('checkbox', { name: 'Select row' }).first().check();

      // Clear filters, then select second template
      await page.getByRole('button', { name: 'Clear all filters' }).click();
      await filterTable({ filterLabel: 'Name', filterValue: workflowJobTemplate2Name }, page);
      await page.getByRole('checkbox', { name: 'Select row' }).first().check();

      // Clear filters to show both selected templates
      await page.getByRole('button', { name: 'Clear all filters' }).click();

      // Click delete from toolbar kebab
      await page.getByLabel('toolbar actions').click();
      await page.getByRole('menuitem', { name: 'Delete templates' }).click();

      // Use the robust confirmation utility
      await confirmAndAssertDeletion(page);

      // Verify we're back on templates list (no cleanup needed as templates are deleted)
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
    }
  );
});

test.describe('Workflow Job Templates: Launch', () => {
  let organizationName: string;
  let inventoryName: string;
  let projectName: string;
  let jobTemplateName: string;
  let workflowJobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page, { organizationName });
    projectName = await Project.ui.create(page, { organizationName });
    jobTemplateName = await JobTemplate.ui.create(page, { inventoryName, projectName });

    // Create workflow job template with a job template node
    workflowJobTemplateName = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page, {
      inventoryName,
    });
    await WorkflowVisualizer.ui.createVisualizerStep(page, 'Job Template', jobTemplateName);

    // Close the visualizer
    await page.getByTestId('workflow-visualizer-toolbar-close').click();
  });

  test.afterEach(async ({ page }) => {
    // Use API-based cleanup to cancel running jobs and avoid timeout
    await WorkflowJobTemplate.api.deleteByName(page, workflowJobTemplateName);
    await JobTemplate.api.deleteByName(page, jobTemplateName);
    await Organization.api.deleteByName(page, organizationName);
  });

  test(
    'can launch a workflow job template from details view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
      await clickTableRow({ text: workflowJobTemplateName, clearFilters: true }, page);

      // Verify we're on the details page
      await expect(
        page.getByRole('heading', { name: workflowJobTemplateName, exact: true })
      ).toBeVisible();

      // Click launch from the kebab dropdown menu using clickPageAction
      await clickPageAction('Launch template', page);

      // Wait for navigation to workflow job output page and verify URL
      await page.waitForURL(/\/jobs\/workflow\/\d+\/output/, { timeout: 15000 });

      // Extract job ID from URL to confirm it's valid
      const url = page.url();
      const match = url.match(/\/jobs\/workflow\/(\d+)\//);
      expect(match).toBeTruthy();
      const workflowJobId = parseInt(match![1], 10);
      expect(workflowJobId).toBeGreaterThan(0);
    }
  );
});

test.describe('Workflow Job Templates: Prompt on Launch', () => {
  let organizationName: string;
  let inventoryName: string;
  let workflowJobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    inventoryName = await Inventory.ui.create(page, { organizationName });
    // Navigate back to templates page after creating resources
    await navigateTo(page, 'Automation Execution', 'Templates');

    // Create workflow job template with prompt on launch enabled
    const result = await WorkflowJobTemplate.ui.create(page, {
      organizationName,
      inventoryName,
      askLimitOnLaunch: true,
    });
    workflowJobTemplateName = result.name;

    // Close the visualizer to get back to a clean state
    await page.getByTestId('workflow-visualizer-toolbar-close').click();
  });

  test.afterEach(async ({ page }) => {
    // Use API-based cleanup to cancel running jobs and avoid timeout
    await WorkflowJobTemplate.api.deleteByName(page, workflowJobTemplateName);
    await Organization.api.deleteByName(page, organizationName);
  });

  test(
    'can launch a workflow job template with prompt on launch values',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();

      // Click launch from the row kebab menu
      await clickTableRowAction(
        {
          text: workflowJobTemplateName,
          action: 'Launch template',
          inKebab: true,
        },
        page
      );

      // Fill in the prompt on launch field
      await expect(page.getByTestId('limit')).toBeVisible();
      await page.getByTestId('limit').fill('localhost');

      // Go to next step
      await page.getByRole('button', { name: 'Next' }).click();

      // Verify the value is shown in the review step
      await expect(page.getByTestId('limit')).toHaveText('localhost');

      // Finish launch (without actually launching to avoid job execution)
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify we're on the output page by checking the URL
      await page.waitForURL(/\/jobs\/workflow\/\d+\/output/, { timeout: 10000 });
    }
  );
});

test.describe('Workflow Job Templates: Output and Details Screen', () => {
  let organizationName: string;
  let inventoryName: string;
  let projectName: string;
  let jobTemplateName: string;
  let workflowJobTemplateName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    projectName = await Project.ui.create(page, { organizationName });
    inventoryName = await Inventory.ui.create(page, { organizationName });
    jobTemplateName = await JobTemplate.ui.create(page, { inventoryName, projectName });

    // Create workflow job template with nodes
    workflowJobTemplateName = await WorkflowVisualizer.ui.createWorkflowJobTemplate(page, {
      inventoryName,
    });
    await WorkflowVisualizer.ui.createVisualizerStep(page, 'Job Template', jobTemplateName);

    // Close visualizer
    await page.getByTestId('workflow-visualizer-toolbar-close').click();
  });

  test.afterEach(async ({ page }) => {
    // Use API-based cleanup to cancel running jobs and avoid timeout
    await WorkflowJobTemplate.api.deleteByName(page, workflowJobTemplateName);
    await JobTemplate.api.deleteByName(page, jobTemplateName);
    await Organization.api.deleteByName(page, organizationName);
  });

  test(
    'can launch a workflow job, let it finish, and assert expected results on output and details screens',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(5 * 60 * 1000);

      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();

      // Navigate to the workflow job template details page
      await clickTableRow({ text: workflowJobTemplateName, clearFilters: true }, page);

      // Verify we're on the details page
      await expect(
        page.getByRole('heading', { name: workflowJobTemplateName, exact: true })
      ).toBeVisible();

      // Click launch from the kebab dropdown menu
      await clickPageAction('Launch template', page);

      // Wait for navigation to workflow job output page
      await page.waitForURL(/\/jobs\/workflow\/\d+\/output/, { timeout: 15000 });

      // Extract workflow job ID from URL
      const url = page.url();
      const match = url.match(/\/jobs\/workflow\/(\d+)\//);
      expect(match).toBeTruthy();
      const workflowJobId = parseInt(match![1], 10);

      // Wait for workflow job to complete
      await WorkflowJobTemplate.ui.waitForJobStatus(page, workflowJobId, 'successful');

      // Verify we're on the output page
      await expect(
        page.getByRole('heading', { name: workflowJobTemplateName }).first()
      ).toBeVisible();
      expect(page.url()).toContain(`/jobs/workflow/${workflowJobId}/output`);

      // Click Details tab
      await page.getByRole('tab', { name: 'Details', exact: true }).click();

      // Verify we're on the details page
      expect(page.url()).toContain(`/jobs/workflow/${workflowJobId}/details`);

      // Verify details are displayed
      await expect(page.getByTestId('name')).toContainText(workflowJobTemplateName);
      await expect(page.getByTestId('type')).toContainText('Workflow job');
      await expect(page.getByTestId('inventory')).toContainText(inventoryName);
    }
  );
});
