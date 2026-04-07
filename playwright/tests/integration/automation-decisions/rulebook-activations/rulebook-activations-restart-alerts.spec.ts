import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { edaAPI } from '@ansible/playwright/commands/apiClient';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  DecisionEnvironment,
  EdaCredential,
  EdaProject,
  RulebookActivation,
} from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

test.describe('Rulebook Activations - Restart with Project Update Alerts', () => {
  test.beforeAll(() => {
    if (isSaaS()) {
      test.skip(true, 'Rulebook activations not available on SaaS deployments');
    }
  });

  const organizationName = 'Default';
  let organizationId: number;
  let projectName: string;
  let credentialName: string;
  let decisionEnvironmentName: string;

  test.beforeEach(async ({ page }) => {
    // Get the Default organization ID
    const orgs = await edaAPI.get<{ results: EdaOrganization[] }>(
      page,
      `/organizations/?name=${organizationName}`
    );
    if (!orgs?.results?.[0]) {
      throw new Error('Default organization not found');
    }
    organizationId = orgs.results[0].id;

    // Create project WITHOUT update_revision_on_launch for the second test
    const project = await EdaProject.api.create(page, {
      organization: organizationId,
      update_revision_on_launch: false,
    });
    projectName = project.name;
    credentialName = await EdaCredential.ui.create(page, { organizationName });
    decisionEnvironmentName = await DecisionEnvironment.ui.create(page, { organizationName });
  });

  test.afterEach(async ({ page }) => {
    await DecisionEnvironment.api.deleteByName(page, decisionEnvironmentName);
    await EdaCredential.api.deleteByName(page, credentialName);
    await EdaProject.api.deleteByName(page, projectName);
  });

  test(
    'should show alert when restarting activation with project that has update_revision_on_launch',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(200000);

      // Create project via API with update_revision_on_launch enabled
      const projectWithUpdate = await EdaProject.api.create(page, {
        organization: organizationId,
        update_revision_on_launch: true,
      });

      try {
        // Create two activations using the same project
        const activation1Name = await RulebookActivation.ui.create(page, {
          projectName: projectWithUpdate.name,
          credentialName,
          decisionEnvironmentName,
          organizationName,
        });

        const activation2Name = await RulebookActivation.ui.create(page, {
          projectName: projectWithUpdate.name,
          credentialName,
          decisionEnvironmentName,
          organizationName,
        });

        // Navigate to first activation details page
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await clickTableRow(
          {
            text: activation1Name,
            pageTitle: 'Rulebook Activations',
            filterLabel: 'Name',
            filterValue: activation1Name,
            clearFilters: true,
          },
          page
        );

        // Click restart button
        await clickPageAction('Restart rulebook activation', page);

        // Verify the confirmation dialog appears
        const confirmDialog = page.getByRole('dialog');
        await expect(confirmDialog).toBeVisible();

        // Verify the alert message about project update and impacted activations
        await expect(confirmDialog).toContainText(
          `Project ${projectWithUpdate.name} is assigned to this rulebook activation`
        );
        await expect(confirmDialog).toContainText(
          'It is configured to update on rulebook activation restart'
        );
        await expect(confirmDialog).toContainText(
          'which may impact the following rulebook activations'
        );
        await expect(confirmDialog).toContainText(activation1Name);
        await expect(confirmDialog).toContainText(activation2Name);

        // Cancel the dialog
        await confirmDialog.getByRole('button', { name: 'Cancel' }).click();

        // Cleanup
        await RulebookActivation.ui.delete(page, activation1Name);
        await RulebookActivation.ui.delete(page, activation2Name);
      } finally {
        await EdaProject.api.deleteByName(page, projectWithUpdate.name);
      }
    }
  );

  test(
    'should not show project alert when restarting activation with project that does not have update_revision_on_launch',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(150000);

      // Use the default project created in beforeEach (which doesn't have update_revision_on_launch)
      const rulebookActivationName = await RulebookActivation.ui.create(page, {
        projectName,
        credentialName,
        decisionEnvironmentName,
        organizationName,
      });

      // Navigate to activation details page
      await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
      await clickTableRow(
        {
          text: rulebookActivationName,
          pageTitle: 'Rulebook Activations',
          filterLabel: 'Name',
          filterValue: rulebookActivationName,
          clearFilters: true,
        },
        page
      );

      // Click restart button
      await clickPageAction('Restart rulebook activation', page);

      // Verify the confirmation dialog appears
      const confirmDialog = page.getByRole('dialog');
      await expect(confirmDialog).toBeVisible();

      // Verify the project update alert does NOT appear
      await expect(confirmDialog).not.toContainText('is assigned to this rulebook activation');
      await expect(confirmDialog).not.toContainText(
        'It is configured to update on rulebook activation restart'
      );

      // Cancel the dialog
      await confirmDialog.getByRole('button', { name: 'Cancel' }).click();

      // Cleanup
      await RulebookActivation.ui.delete(page, rulebookActivationName);
    }
  );
});
