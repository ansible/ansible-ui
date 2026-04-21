import type { EdaProject as EdaProjectType } from '@ansible/eda-ui/interfaces/EdaProject';
import type { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { edaAPI } from '@ansible/playwright/commands/apiClient';
import { bulkDeleteResources } from '@ansible/playwright/commands/bulkDeleteResources';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  DecisionEnvironment,
  EdaCredential,
  EdaProject,
  Organization,
  RulebookActivation,
} from '@ansible/playwright/utils';
import { EdaOrganization } from '@ansible/playwright/utils/edaOrganization';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/projects' }));
test.afterEach(setupAfter);

test.describe('EDA Projects List', () => {
  let organization: PlatformOrganization;
  let edaOrgId: number;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);
    edaOrgId = edaOrganization.id;
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
      organization: edaOrgId,
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

    // Wait for navigation to complete and page to load with updated name
    await expect(page.getByTestId('page-title')).toHaveText(editedName);
    await expect(page.getByTestId('name')).toHaveText(editedName);

    // Ensure sync is idle before DELETE; the API may return 409 while sync is pending/running.
    await EdaProject.api.waitForSync(page, edaProject.id);
    await EdaProject.api.delete(page, edaProject.id);
  });

  test('should bulk delete multiple projects', { tag: ['@not_mock'] }, async ({ page }) => {
    const edaProject1 = await EdaProject.api.create(page, {
      organization: edaOrgId,
    });
    const edaProject2 = await EdaProject.api.create(page, {
      organization: edaOrgId,
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
        organization: edaOrgId,
      });

      await navigateTo(page, 'Automation Decisions', 'Projects');
      const projectRow = await getTableRow(page, edaProject.name);

      // Wait for project to complete initial sync
      await expect(projectRow.getByText('Completed')).toBeVisible({ timeout: 60 * 1000 });

      // Verify sync button is visible before clicking
      const syncButton = projectRow.getByRole('button', { name: 'Sync project' });
      await expect(syncButton).toBeVisible();

      await syncButton.click();

      // Confirm the sync dialog
      const confirmDialog = page.getByRole('dialog');
      await expect(confirmDialog).toBeVisible();
      await expect(confirmDialog).toContainText(`Sync project ${edaProject.name}`);

      // Check the confirmation checkbox to enable the sync button
      await confirmDialog.getByRole('checkbox', { name: /Yes, I confirm/ }).check();
      await confirmDialog.getByRole('button', { name: 'Sync projects' }).click();
      await expect(confirmDialog).not.toBeVisible();

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

  test(
    'should show alert message when syncing project with auto-restart activations',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);

      const credentialName = await EdaCredential.ui.create(page, {
        organizationName: organization.name,
      });
      const decisionEnvironmentName = await DecisionEnvironment.ui.create(page, {
        organizationName: organization.name,
      });
      const projectName = await EdaProject.ui.create(page, {
        organizationName: organization.name,
      });

      try {
        // Create two rulebook activations via UI
        const activation1Name = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName: organization.name,
          disabled: true,
        });

        const activation2Name = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName: organization.name,
          disabled: true,
        });

        // Get activation IDs via API and enable restart_on_project_update
        const activations = await edaAPI.get<{ results: EdaRulebookActivation[] }>(
          page,
          'activations/'
        );
        const activation1 = activations?.results.find((a) => a.name === activation1Name);
        const activation2 = activations?.results.find((a) => a.name === activation2Name);

        if (!activation1 || !activation2) {
          throw new Error('Failed to find created activations');
        }

        // Patch activations to enable restart_on_project_update
        await edaAPI.patch(page, `activations/${activation1.id}/`, {
          restart_on_project_update: true,
        });
        await edaAPI.patch(page, `activations/${activation2.id}/`, {
          restart_on_project_update: true,
        });

        // Sync the project
        await navigateTo(page, 'Automation Decisions', 'Projects');
        const projectRow = await getTableRow(page, projectName);
        await expect(projectRow.getByText('Completed')).toBeVisible({ timeout: 60 * 1000 });

        const syncButton = projectRow.getByRole('button', { name: 'Sync project' });
        await expect(syncButton).toBeVisible();
        await syncButton.click();

        // Verify the confirmation dialog appears
        const confirmDialog = page.getByRole('dialog');
        await expect(confirmDialog).toBeVisible();

        // Verify the alert message about auto-restart activations
        await expect(confirmDialog).toContainText(
          'The following Rulebook Activations are configured to restart on project sync.'
        );
        await expect(confirmDialog).toContainText(activation1Name);
        await expect(confirmDialog).toContainText(activation2Name);

        // Cancel the dialog
        await confirmDialog.getByRole('button', { name: 'Cancel' }).click();

        // Cleanup
        await RulebookActivation.ui.delete(page, activation1Name);
        await RulebookActivation.ui.delete(page, activation2Name);
      } finally {
        await EdaProject.api.deleteByName(page, projectName);
        await DecisionEnvironment.api.deleteByName(page, decisionEnvironmentName);
        await EdaCredential.api.deleteByName(page, credentialName);
      }
    }
  );

  test(
    'should not show alert message when syncing project without auto-restart activations',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);

      const credentialName = await EdaCredential.ui.create(page, {
        organizationName: organization.name,
      });
      const decisionEnvironmentName = await DecisionEnvironment.ui.create(page, {
        organizationName: organization.name,
      });
      const projectName = await EdaProject.ui.create(page, {
        organizationName: organization.name,
      });

      try {
        // Create rulebook activation via UI (restart_on_project_update defaults to false)
        const activationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName: organization.name,
          disabled: true,
        });

        // Sync the project
        await navigateTo(page, 'Automation Decisions', 'Projects');
        const projectRow = await getTableRow(page, projectName);
        await expect(projectRow.getByText('Completed')).toBeVisible({ timeout: 60 * 1000 });

        const syncButton = projectRow.getByRole('button', { name: 'Sync project' });
        await expect(syncButton).toBeVisible();
        await syncButton.click();

        // Verify the confirmation dialog appears
        const confirmDialog = page.getByRole('dialog');
        await expect(confirmDialog).toBeVisible();

        // Verify the alert message about auto-restart activations does NOT appear
        await expect(confirmDialog).not.toContainText(
          'The following Rulebook Activations are configured to restart on project sync.'
        );

        // Cancel the dialog
        await confirmDialog.getByRole('button', { name: 'Cancel' }).click();

        // Cleanup
        await RulebookActivation.ui.delete(page, activationName);
      } finally {
        await EdaProject.api.deleteByName(page, projectName);
        await DecisionEnvironment.api.deleteByName(page, decisionEnvironmentName);
        await EdaCredential.api.deleteByName(page, credentialName);
      }
    }
  );
});
