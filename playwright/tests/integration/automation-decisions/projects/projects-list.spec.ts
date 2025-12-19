import { expect, test } from '@playwright/test';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { EdaProject, Organization } from '@ansible/playwright/utils';
import type { EdaProject as EdaProjectType } from '@ansible/eda-ui/interfaces/EdaProject';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';

test.beforeEach(setupBefore({ path: '/decisions/projects' }));
test.afterEach(setupAfter);

test.describe('EDA Projects List', () => {
  let organization: PlatformOrganization;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
  });

  test.afterEach(async ({ page }) => {
    await Organization.api.delete(page, organization.id);
  });

  test(
    'should create project, verify sync status, and delete project',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const edaProjectName = await EdaProject.ui.create(page, {
        organizationName: organization.name,
      });

      await expect(page.getByTestId('page-title')).toHaveText(edaProjectName);
      await expect(page.getByTestId('name')).toHaveText(edaProjectName);
      await expect(page.getByRole('link', { name: organization.name })).toBeVisible();
      await expect(page.getByText('Completed')).toBeVisible({ timeout: 60 * 1000 });

      await navigateTo(page, 'Automation Decisions', 'Projects');

      // Verify project sync is completed and sync button is visible
      const projectRow = await getTableRow(page, edaProjectName);
      await expect(projectRow.getByText('Completed')).toBeVisible({ timeout: 60 * 1000 });
      await expect(projectRow.getByRole('button', { name: 'Sync project' })).toBeVisible();

      await clickTableRowAction(
        {
          text: edaProjectName,
          action: 'Delete project',
          clearFilters: true,
        },
        page
      );
    }
  );

  test('should edit project name from row action', { tag: ['@not_mock'] }, async ({ page }) => {
    const edaProject: EdaProjectType = await EdaProject.api.create(page, {
      organization: organization.id,
    });
    const editedName = `${edaProject.name} - edited`;

    await navigateTo(page, 'Automation Decisions', 'Projects');
    await clickTableRowAction(
      {
        text: edaProject.name,
        action: 'Edit project',
        clearFilters: true,
      },
      page
    );
    await expect(page.getByRole('heading', { name: `Edit ${edaProject.name}` })).toBeVisible();
    await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
    await page.getByRole('textbox', { name: 'Name', exact: true }).fill(editedName);
    await page.getByRole('button', { name: 'Save project', exact: true }).click();

    await expect(page.getByRole('heading', { name: editedName, exact: true })).toBeVisible();
    await expect(page.getByTestId('name')).toHaveText(editedName);

    await EdaProject.api.delete(page, edaProject.id);
  });

  test('should bulk delete multiple projects', { tag: ['@not_mock'] }, async ({ page }) => {
    const edaProject1 = await EdaProject.api.create(page, {
      organization: organization.id,
    });
    const edaProject2 = await EdaProject.api.create(page, {
      organization: organization.id,
    });

    await bulkDeleteResources(
      {
        resourceType: 'projects',
        resourceNames: [edaProject1.name, edaProject2.name],
        filterLabel: 'Name',
        navigationPath: ['Automation Decisions', 'Projects'],
      },
      page
    );
  });

  test(
    'should hide project row sync button during active sync',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const edaProject: EdaProjectType = await EdaProject.api.create(page, {
        organization: organization.id,
      });

      await navigateTo(page, 'Automation Decisions', 'Projects');
      const projectRow = await getTableRow(page, edaProject.name);

      // Wait for project to complete initial sync
      await expect(projectRow.getByText('Completed')).toBeVisible({ timeout: 60 * 1000 });

      // Verify sync button is visible before clicking
      const syncButton = projectRow.getByRole('button', { name: 'Sync project' });
      await expect(syncButton).toBeVisible();

      await syncButton.click();
      await expect(page.getByTestId('alert-toaster')).toContainText(`Syncing ${edaProject.name}`);
      await page.getByTestId('alert-toaster').getByLabel('Close').click();

      await page.reload();

      // Check if status is Pending or Running
      const statusCell = projectRow.locator('td').nth(3); // Status is the 4th column (0-indexed)
      const statusText = await statusCell.textContent();

      // If status is Pending or Running, verify sync button is not visible
      if (statusText?.includes('Pending') || statusText?.includes('Running')) {
        await expect(projectRow.getByRole('button', { name: 'Sync project' })).not.toBeVisible();
      }

      // Wait for sync to complete before cleanup
      await expect(projectRow.getByText('Completed')).toBeVisible({ timeout: 60 * 1000 });

      await EdaProject.api.delete(page, edaProject.id);
    }
  );
});
