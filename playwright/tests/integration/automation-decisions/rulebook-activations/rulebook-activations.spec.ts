import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { clickTableRowAction } from '@ansible/playwright/commands/clickTableRowAction';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  DecisionEnvironment,
  EdaCredential,
  EdaProject,
  EventStream,
  Organization,
  RulebookActivation,
} from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

// Rulebook activations are not available on SaaS deployments (skip logic backported from fix-playwright-skip-logic)
test.describe('Rulebook Activations', () => {
  test.beforeAll(() => {
    if (isSaaS()) {
      test.skip(true, 'Rulebook activations not available on SaaS deployments');
    }
  });

  let organizationName: string;
  let projectName: string;
  let credentialName: string;
  let decisionEnvironmentName: string;

  // Create test resources
  test.beforeEach(async ({ page }) => {
    organizationName = await Organization.ui.create(page);
    projectName = await EdaProject.ui.create(page, { organizationName });
    credentialName = await EdaCredential.ui.create(page, { organizationName });
    decisionEnvironmentName = await DecisionEnvironment.ui.create(page, { organizationName });
  });

  test.afterEach(async ({ page }) => {
    // Clean up resources via API (faster and more reliable than UI)
    await DecisionEnvironment.api.deleteByName(page, decisionEnvironmentName);
    await EdaCredential.api.deleteByName(page, credentialName);
    await EdaProject.api.deleteByName(page, projectName);
    await Organization.api.deleteByName(page, organizationName);
  });

  test.describe('Create', () => {
    test(
      'can create a rulebook activation and assert info on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(300000);

        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName,
        });
        await expect(page.getByTestId('name')).toHaveText(rulebookActivationName);
        await expect(page.getByTestId('project')).toHaveText(projectName);
        await expect(page.getByLabel('Label group category').getByRole('listitem')).toContainText(
          credentialName
        );
        await RulebookActivation.ui.delete(page, rulebookActivationName);
      }
    );

    test(
      'can create with restart policy and restart from list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);

        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          organizationName,
          decisionEnvironmentName,
          restartPolicy: 'Always',
        });
        await expect(page.getByTestId('name')).toHaveText(rulebookActivationName);
        await expect(page.getByTestId('restart-policy')).toHaveText('Always');
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(rulebookActivationName);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await page
          .getByRole('row', { name: rulebookActivationName })
          .getByLabel('kebab dropdown toggle')
          .click();
        await page.getByRole('menuitem', { name: 'Restart rulebook activation' }).click();
        await expect(
          page.getByRole('dialog', { name: 'Restart rulebook activations' })
        ).toBeVisible();
        await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await page.getByRole('button', { name: 'Restart rulebook activations' }).click();
        await expect(page.getByRole('dialog')).toContainText('Success');
        await page.getByRole('button', { name: 'Close' }).click();
        await RulebookActivation.ui.delete(page, rulebookActivationName);
      }
    );
  });

  test.describe('Edit', () => {
    test(
      'can edit a rulebook activation from the list view and assert info on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);
        // Create as disabled to avoid timing issues with activation state transitions
        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName,
          disabled: true,
        });
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(rulebookActivationName);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await expect(page.locator('tbody tr')).toHaveCount(1);
        await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
        await page.getByRole('textbox', { name: 'Description' }).fill('edited description');
        await page.getByRole('checkbox', { name: 'Skip audit events' }).check();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
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
        await expect(page.getByRole('main')).toContainText('Last edited');
        await expect(page.locator('#description')).toContainText('edited description');
        await expect(page.locator('#enabled-option')).toContainText('Skip audit events');
        await RulebookActivation.ui.delete(page, rulebookActivationName);
      }
    );

    test(
      'can edit a rulebook activation from the details view and assert info on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);
        // Create as disabled to avoid timing issues with activation state transitions
        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName,
          disabled: true,
        });
        await expect(page.getByRole('heading', { name: rulebookActivationName })).toBeVisible();
        await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
        await page.getByRole('textbox', { name: 'Description' }).click();
        await page.getByRole('textbox', { name: 'Description' }).fill('edited description');
        await page.getByRole('checkbox', { name: 'Skip audit events' }).check();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
        await expect(page.getByRole('main')).toContainText('Last edited');
        await expect(page.locator('#description')).toContainText('edited description');
        await expect(page.locator('#enabled-option')).toContainText('Skip audit events');
        await RulebookActivation.ui.delete(page, rulebookActivationName);
      }
    );

    test(
      'can edit a rulebook activation with source-event stream mapping from the details view and assert info on the details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(180000);
        const eventStreamOne = await EventStream.ui.create(page, { organizationName });
        const eventStreamTwo = await EventStream.ui.create(page, { organizationName });
        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          disabled: true,
          organizationName,
          decisionEnvironmentName,
        });
        await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
        await page.getByRole('textbox', { name: 'Description' }).click();
        await page.getByRole('textbox', { name: 'Description' }).fill('edited description');
        await page
          .locator('#source-mappings-form-group')
          .getByRole('button', { name: 'Options menu' })
          .click();
        await page.getByRole('button', { name: 'Rulebook source' }).click();
        await page.getByRole('option', { name: '__SOURCE_1' }).click();
        await page.getByRole('button', { name: 'Event stream' }).click();
        await page.getByRole('option', { name: eventStreamOne }).click();
        await page.getByRole('button', { name: 'Save' }).click();

        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
        await expect(page.getByRole('link', { name: eventStreamOne })).toBeVisible();

        await page.getByRole('button', { name: 'Edit rulebook activation' }).click();

        await expect(page.getByText(eventStreamOne)).toBeVisible();
        await page
          .locator('#source-mappings-form-group')
          .getByRole('button', { name: 'Options menu' })
          .click();
        await page.getByRole('button', { name: 'Rulebook source' }).click();
        await page.getByRole('option', { name: '__SOURCE_1' }).click();
        await page.getByRole('button', { name: 'Event stream' }).click();
        await page.getByRole('option', { name: eventStreamTwo }).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
        await expect(page.getByRole('link', { name: eventStreamTwo })).toBeVisible();
        await RulebookActivation.ui.delete(page, rulebookActivationName);
        // Delete event streams via API (more reliable than UI when resources may still be referenced)
        await EventStream.api.deleteByName(page, eventStreamOne);
        await EventStream.api.deleteByName(page, eventStreamTwo);
      }
    );

    test(
      'can edit a rulebook activation with event source mapping and change the rulebook',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(180000);
        const eventStreamOne = await EventStream.ui.create(page, { organizationName });
        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          disabled: true,
          organizationName,
          decisionEnvironmentName,
        });
        await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
        await expect(page.locator('#source-mappings-form-group')).toBeVisible();

        await page
          .locator('#source-mappings-form-group')
          .getByRole('button', { name: 'Options menu' })
          .click();
        await page.getByRole('button', { name: 'Rulebook source' }).click();
        await page.getByRole('option', { name: '__SOURCE_1' }).click();
        await page.getByRole('button', { name: 'Event stream' }).click();
        await page.getByRole('option', { name: eventStreamOne }).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(
          page.getByRole('heading', { name: `Edit ${rulebookActivationName}` })
        ).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save rulebook activation' })).toBeVisible();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
        await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();

        await navigateTo(page, 'Automation Decisions', 'Projects');
        await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(projectName);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await page.getByRole('link', { name: projectName }).click();
        await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Edit project' })).toBeVisible();
        await page.getByRole('button', { name: 'Edit project' }).click();
        await expect(page.getByRole('heading', { name: `Edit ${projectName}` })).toBeVisible();
        await page.getByRole('textbox', { name: 'Source control branch/tag/' }).click();
        await page
          .getByRole('textbox', { name: 'Source control branch/tag/' })
          .fill('basic-short-new');
        await page.getByRole('button', { name: 'Save project' }).click();
        await page.getByRole('button', { name: 'Sync project' }).click();
        await expect(page.getByText('Completed', { exact: true })).toContainText('Completed', {
          timeout: 15000,
        });
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
        await clickPageAction('Edit rulebook activation', page);
        await page.getByRole('textbox', { name: 'Description' }).click();
        await page.getByRole('textbox', { name: 'Description' }).fill('edited description');
        await expect(page.getByRole('button', { name: 'Save rulebook activation' })).toBeVisible();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();
        await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
        await RulebookActivation.ui.delete(page, rulebookActivationName);
        // Delete event stream via API (more reliable than UI when resources may still be referenced)
        await EventStream.api.deleteByName(page, eventStreamOne);
      }
    );
  });

  test.describe('Duplicate', () => {
    test(
      'can duplicate an activation and get a warning when enabling it without changes',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);
        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          organizationName,
          decisionEnvironmentName,
        });
        await expect(page.getByTestId('name')).toHaveText(rulebookActivationName);
        await page.getByRole('button', { name: 'kebab dropdown toggle' }).click();
        await page.getByRole('menuitem', { name: 'Duplicate rulebook activation' }).click();
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await expect(
          page.getByRole('heading', { name: `Success alert: ${rulebookActivationName}` })
        ).toBeVisible();
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await page.getByRole('textbox', { name: 'Type to filter' }).click();
        // find the duplicate
        await page
          .getByRole('textbox', { name: 'Type to filter' })
          .fill(`${rulebookActivationName} @`);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await page.getByRole('link', { name: `${rulebookActivationName} @`, exact: false }).click();
        await expect(page.getByRole('heading', { name: rulebookActivationName })).toBeVisible();
        await expect(page.getByRole('switch', { name: 'Click to enable instance' })).toBeVisible();
        await page
          .locator('label', {
            has: page.locator('input[aria-label="Click to enable instance"]'),
          })
          .locator('span')
          .first()
          .click();
        await expect(
          page.getByRole('dialog', { name: 'Enable rulebook activations' })
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Enable rulebook activations' })
        ).toBeVisible();
        await expect(page.getByText('Note: This warning is')).toBeVisible();
        await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await page.getByRole('button', { name: 'Enable rulebook activations' }).click();
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await page.getByRole('textbox', { name: 'Type to filter' }).click();
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(rulebookActivationName);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await page.waitForTimeout(2000);
        await page.getByRole('checkbox', { name: 'Select all' }).check();
        await page.getByRole('button', { name: 'toolbar actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete rulebook activations' }).click();
        await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await page.getByRole('button', { name: 'Delete rulebook activations' }).click();
      }
    );
  });

  test.describe('List View Operations', () => {
    test(
      'should disable rulebook activation using toggle switch in list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);

        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName,
        });

        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await filterTable({ filterLabel: 'Name', filterValue: rulebookActivationName }, page);
        await expect(page.locator('tbody tr')).toHaveCount(1);

        // Find the toggle switch in the row and click it to disable
        const row = page.getByRole('row', { name: rulebookActivationName });
        await row.getByTestId('toggle-switch').click();

        // Confirm the disable action in the dialog
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText('Yes, I confirm that I want to disable')).toBeVisible();
        await expect(dialog.locator('td[data-label="Name"]')).toContainText(rulebookActivationName);
        await dialog.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await dialog.getByRole('button', { name: 'Disable rulebook activations' }).click();

        // Verify the dialog shows success
        await expect(dialog).toContainText('Success');
        await dialog.getByRole('button', { name: 'Close' }).click();

        // Cleanup
        await RulebookActivation.ui.delete(page, rulebookActivationName);
      }
    );

    test(
      'should delete rulebook activation from kebab menu in list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);

        const rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName,
          disabled: true,
        });

        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');

        // Use clickTableRowAction to click the delete action from kebab menu
        await clickTableRowAction(
          {
            text: rulebookActivationName,
            filterLabel: 'Name',
            action: 'Delete rulebook activation',
            inKebab: true,
          },
          page
        );

        // Confirm the delete action in the dialog
        const deleteDialog = page.getByRole('dialog');
        await expect(deleteDialog).toBeVisible();
        await expect(deleteDialog.getByText('Yes, I confirm that I want to delete')).toBeVisible();
        await expect(deleteDialog.locator('td[data-label="Name"]')).toContainText(
          rulebookActivationName
        );
        await deleteDialog.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await deleteDialog.getByRole('button', { name: 'Delete rulebook activations' }).click();

        // Verify the dialog shows success
        await expect(deleteDialog).toContainText('Success');
        await deleteDialog.getByRole('button', { name: 'Close' }).click();
      }
    );
  });

  test.describe('Bulk Operations', () => {
    test(
      'should bulk delete rulebook activations from toolbar',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(200000);

        // Create two rulebook activations for bulk delete testing
        const rulebookActivationName1 = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName,
          disabled: true,
        });

        const rulebookActivationName2 = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName,
          decisionEnvironmentName,
          organizationName,
          disabled: true,
        });

        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');

        // Select first activation
        await clearTableFilters(page);
        await filterTable({ filterLabel: 'Name', filterValue: rulebookActivationName1 }, page);
        await expect(page.locator('tbody tr')).toHaveCount(1);
        await page.getByRole('checkbox', { name: 'Select row' }).first().check();
        await clearTableFilters(page);

        // Select second activation
        await filterTable({ filterLabel: 'Name', filterValue: rulebookActivationName2 }, page);
        await expect(page.locator('tbody tr')).toHaveCount(1);
        await page.getByRole('checkbox', { name: 'Select row' }).first().check();
        await clearTableFilters(page);

        // Click toolbar actions and delete
        await page.getByRole('button', { name: 'toolbar actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete rulebook activations' }).click();

        // Confirm the delete action in the dialog
        const bulkDeleteDialog = page.getByRole('dialog');
        await expect(bulkDeleteDialog).toBeVisible();
        await expect(
          bulkDeleteDialog.getByText('Yes, I confirm that I want to delete')
        ).toBeVisible();
        await bulkDeleteDialog
          .getByRole('checkbox', { name: 'Yes, I confirm that I want to' })
          .check();
        await bulkDeleteDialog.getByRole('button', { name: 'Delete rulebook activations' }).click();

        // Verify the dialog shows success
        await expect(bulkDeleteDialog).toContainText('Success');
        await bulkDeleteDialog.getByRole('button', { name: 'Close' }).click();
      }
    );
  });
});
