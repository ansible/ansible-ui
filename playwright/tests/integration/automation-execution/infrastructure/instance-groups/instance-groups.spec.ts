import { InstanceGroup as InstanceGroupType } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { awxAPI } from '@ansible/playwright/commands/apiClient';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  InstanceGroup,
  Inventory,
  Organization,
  Project,
  Team,
  User,
} from '@ansible/playwright/utils';
import { expect, Page, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/instance-groups' }));
test.afterEach(setupAfter);

/**
 * Helper to fill the instance/container group edit form
 */
async function fillEditForm(
  page: Page,
  newName: string,
  isContainer: boolean,
  values = { min: '1', percent: '2', maxJobs: '3', maxForks: '4' }
) {
  const nameField = page.getByRole('textbox', { name: 'Name' });
  await nameField.clear();
  await nameField.fill(newName);

  if (!isContainer) {
    const minField = page.getByRole('spinbutton', { name: 'Policy instance minimum' });
    await minField.clear();
    await minField.fill(values.min);

    const percentField = page.getByRole('spinbutton', { name: 'Policy instance percentage' });
    await percentField.clear();
    await percentField.fill(values.percent);
  }

  const maxJobsField = page.getByRole('spinbutton', { name: 'Max concurrent jobs' });
  await maxJobsField.clear();
  await maxJobsField.fill(values.maxJobs);

  const maxForksField = page.getByRole('spinbutton', { name: 'Max forks' });
  await maxForksField.clear();
  await maxForksField.fill(values.maxForks);
}

/**
 * Helper to verify instance/container group details
 */
async function verifyGroupDetails(page: Page, isContainer: boolean) {
  if (!isContainer) {
    await expect(page.getByTestId('policy-instance-minimum')).toContainText('1');
    await expect(page.getByTestId('policy-instance-percentage')).toContainText('2%');
  }
  await expect(page.getByTestId('max-concurrent-jobs')).toContainText('3');
  await expect(page.getByTestId('max-forks')).toContainText('4');
}

// Parameterized tests for instance groups and container groups
[
  { type: 'instance group', isContainer: false },
  { type: 'container group', isContainer: true },
].forEach(({ type, isContainer }) => {
  test.describe(`${type} tests`, () => {
    test.describe(`${type}: List view`, () => {
      test(
        `should create new ${type} from list view, verify details, and delete`,
        { tag: ['@not_mock'] },
        async ({ page }) => {
          const groupName = createE2EName(isContainer ? 'container-group' : 'instance-group');

          await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
          await page.getByLabel('dropdown toggle', { exact: true }).click();

          if (isContainer) {
            await page.getByRole('menuitem', { name: 'Create container group' }).click();
          } else {
            await page.getByRole('menuitem', { name: 'Create instance group' }).click();
          }

          await page.getByPlaceholder(`Enter ${type} name`).fill(groupName);

          if (!isContainer) {
            await page.getByLabel('Policy instance minimum').clear();
            await page.getByLabel('Policy instance minimum').fill('1');
            await page.getByLabel('Policy instance percentage').clear();
            await page.getByLabel('Policy instance percentage').fill('2');
          }

          await page.getByLabel('Max concurrent jobs').clear();
          await page.getByLabel('Max concurrent jobs').fill('3');
          await page.getByLabel('Max forks').clear();
          await page.getByLabel('Max forks').fill('4');

          await page.getByRole('button', { name: `Create ${type}` }).click();

          await expect(page.getByRole('heading', { name: groupName, exact: true })).toBeVisible();
          await expect(page.getByTestId('name')).toContainText(groupName);

          if (!isContainer) {
            await expect(page.getByTestId('policy-instance-minimum')).toContainText('1');
            await expect(page.getByTestId('policy-instance-percentage')).toContainText('2%');
          }

          await expect(page.getByTestId('max-concurrent-jobs')).toContainText('3');
          await expect(page.getByTestId('max-forks')).toContainText('4');

          await clickPageAction(`Delete ${type}`, page);
          await page.locator('#confirm').click();
          await page.getByRole('button', { name: `Delete ${type}`, exact: true }).click();
          await expect(page.getByRole('heading', { name: 'Instance Groups' })).toBeVisible();

          // Cleanup via API if needed
          await InstanceGroup.api.deleteByName(page, groupName);
        }
      );

      test(`should edit ${type} from list view`, { tag: ['@not_mock'] }, async ({ page }) => {
        const groupName = createE2EName(isContainer ? 'container-group' : 'instance-group');

        // Navigate to establish session before API call
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');

        const group = await InstanceGroup.api.create(page, {
          name: groupName,
          is_container_group: isContainer,
          max_concurrent_jobs: 0,
          max_forks: 0,
          ...(isContainer ? { pod_spec_override: '' } : { policy_instance_minimum: 0 }),
        });

        try {
          await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
          await clickTableRowAction(
            {
              text: groupName,
              action: `Edit ${type}`,
              filterLabel: 'Name',
              clearFilters: true,
            },
            page
          );

          await expect(page.getByRole('heading', { name: `Edit ${groupName}` })).toBeVisible();

          await fillEditForm(page, `${groupName}-edited`, isContainer);
          await page.getByRole('button', { name: `Save ${type}` }).click();

          await expect(
            page.getByRole('heading', { name: `${groupName}-edited`, exact: true })
          ).toBeVisible();
          await verifyGroupDetails(page, isContainer);
        } finally {
          await InstanceGroup.api.delete(page, group.id);
        }
      });

      test(
        `should bulk delete ${type}s with success and warning scenarios`,
        { tag: ['@not_mock'] },
        async ({ page }) => {
          const groupNames: string[] = [];

          // Navigate to establish session before API calls
          await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');

          // Create 7 groups total for testing
          for (let i = 0; i < 7; i++) {
            const groupName = createE2EName(isContainer ? 'container-group' : 'instance-group');
            groupNames.push(groupName);
            await InstanceGroup.api.create(page, {
              name: groupName,
              is_container_group: isContainer,
              max_concurrent_jobs: 0,
              max_forks: 0,
              ...(isContainer ? { pod_spec_override: '' } : { policy_instance_minimum: 100 }),
            });
          }

          try {
            // Bulk delete all 7 groups
            // Note: Menu item is always "Delete instance groups" regardless of type
            await bulkDeleteResources(
              {
                resourceType: 'instance groups',
                resourceNames: groupNames,
                navigationPath: ['Automation Execution', 'Infrastructure', 'Instance Groups'],
                filterLabel: 'Name',
              },
              page
            );

            // Wait for deletion to complete
            await expect(page.getByRole('dialog')).toBeHidden({ timeout: 15000 });
            await expect(page.getByRole('heading', { name: 'Instance Groups' })).toBeVisible();
          } finally {
            // Cleanup any remaining groups
            for (const groupName of groupNames) {
              await InstanceGroup.api.deleteByName(page, groupName);
            }
          }
        }
      );
    });

    test.describe(`${type}: Details tab`, () => {
      test(`should edit ${type} from details page`, { tag: ['@not_mock'] }, async ({ page }) => {
        const groupName = createE2EName(isContainer ? 'container-group' : 'instance-group');

        // Navigate to establish session before API call
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');

        const group = await InstanceGroup.api.create(page, {
          name: groupName,
          is_container_group: isContainer,
          max_concurrent_jobs: 0,
          max_forks: 0,
          ...(isContainer ? { pod_spec_override: '' } : { policy_instance_minimum: 0 }),
        });

        try {
          await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
          await clickTableRow({ filterLabel: 'Name', text: groupName }, page);

          await expect(page.getByRole('heading', { name: groupName })).toBeVisible();

          await clickPageAction(`Edit ${type}`, page);

          await expect(page.getByRole('heading', { name: `Edit ${groupName}` })).toBeVisible();

          await fillEditForm(page, `${groupName}-edited`, isContainer);
          await page.getByRole('button', { name: `Save ${type}` }).click();

          await expect(
            page.getByRole('heading', { name: `${groupName}-edited`, exact: true })
          ).toBeVisible();
          await verifyGroupDetails(page, isContainer);
        } finally {
          await InstanceGroup.api.delete(page, group.id);
        }
      });

      test(`should delete ${type} from details page`, { tag: ['@not_mock'] }, async ({ page }) => {
        const groupName = createE2EName(isContainer ? 'container-group' : 'instance-group');

        // Navigate to establish session before API call
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');

        const group = await InstanceGroup.api.create(page, {
          name: groupName,
          is_container_group: isContainer,
          max_concurrent_jobs: 0,
          max_forks: 0,
          ...(isContainer ? { pod_spec_override: '' } : { policy_instance_minimum: 0 }),
        });

        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
        await clickTableRow({ filterLabel: 'Name', text: groupName }, page);

        await expect(page.getByRole('heading', { name: groupName })).toBeVisible();

        await clickPageAction(`Delete ${type}`, page);
        await page.locator('#confirm').click();
        await page.getByRole('button', { name: `Delete ${type}`, exact: true }).click();

        await expect(page.getByRole('heading', { name: 'Instance Groups' })).toBeVisible();

        // Cleanup via API if needed (idempotent - handles 404)
        await InstanceGroup.api.delete(page, group.id);
      });
    });

    test.describe(`${type}: Team access tab`, () => {
      test(
        `should assign and remove team access to ${type}`,
        { tag: ['@not_mock'] },
        async ({ page }) => {
          const organizationName = await Organization.ui.create(page);
          const teamName = await Team.ui.create(page, { organizationName });
          const groupName = createE2EName(isContainer ? 'container-group' : 'instance-group');

          const group = await InstanceGroup.api.create(page, {
            name: groupName,
            is_container_group: isContainer,
            max_concurrent_jobs: 0,
            max_forks: 0,
            ...(isContainer
              ? { pod_spec_override: '', credential: null }
              : { policy_instance_minimum: 0, policy_instance_percentage: 0 }),
          });

          try {
            await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
            await clickTableRow({ filterLabel: 'Name', text: groupName }, page);

            await expect(page.getByRole('heading', { name: groupName })).toBeVisible();

            await page.getByRole('tab', { name: 'Team Access' }).click();

            // Verify empty state
            await expect(
              page.getByText(/No teams are assigned to this instance group./)
            ).toBeVisible();

            await page.getByRole('link', { name: 'Assign teams' }).click();

            // Step 1: Select team
            await expect(page.getByRole('heading', { name: 'Select team(s)' })).toBeVisible();
            await filterTable({ filterLabel: 'Name', filterValue: teamName }, page);
            const teamRow = page.getByRole('row').filter({ hasText: teamName });
            await teamRow.getByRole('checkbox').check();
            await page.getByTestId('Submit').click();

            // Step 2: Select roles
            await expect(
              page.getByRole('heading', { name: 'Select roles to apply' })
            ).toBeVisible();
            const adminRow = page.getByRole('row').filter({ hasText: 'InstanceGroup Admin' });
            await adminRow.getByRole('checkbox').check();
            await page.getByTestId('Submit').click();

            // Step 3: Review - confirm the assignment
            await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible({
              timeout: 10000,
            });
            await page.getByTestId('Submit').click();

            // Wait for wizard to complete - should see success or redirect
            await expect(page.getByRole('heading', { name: 'Assign teams' })).toBeHidden({
              timeout: 10000,
            });

            // Navigate back to instance group Team Access tab
            await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
            await clickTableRow({ filterLabel: 'Name', text: groupName }, page);
            await page.getByRole('tab', { name: 'Team Access' }).click();

            // Verify team appears in list (should be only one)
            await expect(page.getByRole('link', { name: teamName })).toBeVisible({
              timeout: 15000,
            });

            // Remove team access - the button is in the Actions column (last cell in row)
            const teamAccessRow = page.getByRole('row').filter({ hasText: teamName });
            await teamAccessRow.locator('button').last().click();

            // Confirm deletion in modal
            await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
            await page.locator('#confirm').click();
            await page.getByRole('dialog').getByRole('button', { name: 'Remove role' }).click();

            // Wait for removal and verify empty state
            await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
            await expect(
              page.getByText(/No teams are assigned to this instance group./)
            ).toBeVisible({
              timeout: 10000,
            });
          } finally {
            await InstanceGroup.api.delete(page, group.id);
            await Team.ui.delete(page, teamName);
            await Organization.ui.delete(page, organizationName);
          }
        }
      );
    });

    test.describe(`${type}: User access tab`, () => {
      test(`should assign user access to ${type}`, { tag: ['@not_mock'] }, async ({ page }) => {
        const userInfo = await User.ui.create(page);
        const groupName = createE2EName(isContainer ? 'container-group' : 'instance-group');

        const group = await InstanceGroup.api.create(page, {
          name: groupName,
          is_container_group: isContainer,
          max_concurrent_jobs: 0,
          max_forks: 0,
          ...(isContainer ? { pod_spec_override: '' } : { policy_instance_minimum: 0 }),
        });

        try {
          await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
          await clickTableRow({ filterLabel: 'Name', text: groupName }, page);

          await expect(page.getByRole('heading', { name: groupName })).toBeVisible();

          await page.getByRole('tab', { name: 'User Access' }).click();

          await page.getByRole('link', { name: 'Assign users' }).click();

          // Step 1: Select user
          await expect(page.getByRole('heading', { name: 'Select user(s)' })).toBeVisible();
          await filterTable({ filterLabel: 'Username', filterValue: userInfo.userName }, page);
          const userRow = page.getByRole('row').filter({ hasText: userInfo.userName });
          await userRow.getByRole('checkbox').check();
          await page.getByTestId('Submit').click();

          // Step 2: Select roles
          await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
          const adminRow = page.getByRole('row').filter({ hasText: 'InstanceGroup Admin' });
          await adminRow.getByRole('checkbox').check();
          await page.getByTestId('Submit').click();

          // Step 3: Review - confirm the assignment
          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible({
            timeout: 10000,
          });
          await page.getByTestId('Submit').click();

          // Wait for wizard to complete
          await expect(page.getByRole('heading', { name: 'Assign users' })).toBeHidden({
            timeout: 10000,
          });

          // Navigate back to instance group User Access tab
          await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
          await clickTableRow({ filterLabel: 'Name', text: groupName }, page);
          await page.getByRole('tab', { name: 'User Access' }).click();

          // Verify user appears in list (should be only one)
          await expect(page.getByRole('link', { name: userInfo.userName })).toBeVisible({
            timeout: 15000,
          });
        } finally {
          await InstanceGroup.api.delete(page, group.id);
          await User.ui.delete(page, userInfo.userName);
        }
      });
    });
  });
});

// Non-parameterized test for Jobs tab (UAT)
test.describe('Instance Groups: Jobs Tab', () => {
  // Increase timeout for this complex UAT test that creates multiple resources and runs a job
  test.setTimeout(180000); // 3 minutes

  test(
    'should launch job, view in instance group jobs tab, and delete',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const organizationName = await Organization.ui.create(page);
      const projectName = await Project.ui.create(page, { organizationName });
      const inventoryName = await Inventory.ui.create(page, { organizationName });

      // Get the default instance group
      const defaultInstanceGroups = await awxAPI.get<{ results: InstanceGroupType[] }>(
        page,
        '/instance_groups/?name=default'
      );

      if (!defaultInstanceGroups || defaultInstanceGroups.results.length === 0) {
        throw new Error('Default instance group not found');
      }

      const defaultInstanceGroup = defaultInstanceGroups.results[0];

      // Create job template
      const jobTemplateName = createE2EName('job-template');
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByText('Create template', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();

      await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);

      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryName);
      await page.getByRole('option', { name: inventoryName, exact: true }).click();

      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();
      await page.getByPlaceholder('Add a project, then select a').click();
      await page.getByPlaceholder('Add a project, then select a').fill('hello');
      await page.getByRole('option', { name: 'hello_world.yml' }).click();

      await page.getByRole('button', { name: 'Create job template' }).click();
      await expect(page.getByRole('heading', { name: jobTemplateName })).toBeVisible();

      // Launch the job
      await navigateTo(page, 'Automation Execution', 'Templates');
      await filterTable({ filterLabel: 'Name', filterValue: jobTemplateName }, page);

      const row = page.getByRole('row').filter({ hasText: jobTemplateName });
      await row.getByLabel('Launch template').click();

      // Wait for job to complete - use page-title to avoid strict mode violation
      await expect(page.getByTestId('page-title').filter({ hasText: jobTemplateName })).toBeVisible(
        {
          timeout: 30000,
        }
      );

      try {
        // Navigate to instance group jobs tab
        await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Instance Groups');
        await clickTableRow({ filterLabel: 'Name', text: defaultInstanceGroup.name }, page);

        await expect(page.getByRole('heading', { name: defaultInstanceGroup.name })).toBeVisible();

        await page.getByRole('tab', { name: 'Jobs' }).click();

        // Verify job appears in the instance group's jobs list
        await filterTable({ filterLabel: 'Name', filterValue: jobTemplateName }, page);
        await expect(page.getByRole('link', { name: jobTemplateName })).toBeVisible();

        // Delete the job - find the row and click the kebab action
        const jobRow = page.getByRole('row').filter({ hasText: jobTemplateName });
        await jobRow.locator('button').last().click(); // Click kebab/action button
        await page.getByRole('menuitem', { name: 'Delete job' }).click();

        await page.locator('#confirm').click();
        await page.getByRole('dialog').getByRole('button', { name: 'Delete job' }).click();

        // Wait for dialog to close
        await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: defaultInstanceGroup.name })).toBeVisible();
      } finally {
        // Cleanup using UI delete methods which handle their own error recovery
        // Delete job template via UI (faster than searching via API)
        await navigateTo(page, 'Automation Execution', 'Templates');
        await filterTable({ filterLabel: 'Name', filterValue: jobTemplateName }, page);
        const templateRow = page.getByRole('row').filter({ hasText: jobTemplateName });
        if (await templateRow.isVisible({ timeout: 5000 }).catch(() => false)) {
          await templateRow.locator('button').last().click();
          await page.getByRole('menuitem', { name: 'Delete template' }).click();
          await page.locator('#confirm').click();
          await page.getByRole('dialog').getByRole('button', { name: 'Delete template' }).click();
          await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
        }

        await Inventory.ui.delete(page, inventoryName);
        await Project.ui.delete(page, projectName);
        await Organization.ui.delete(page, organizationName);
      }
    }
  );
});
