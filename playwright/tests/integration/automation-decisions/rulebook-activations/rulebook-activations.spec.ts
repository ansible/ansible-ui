import { expect, test } from '@playwright/test';
import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { SAAS_URL } from '@ansible/playwright/commands/constants';
import { expectRowToContain } from '@ansible/playwright/commands/expectRowToContain';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  createOrganization,
  deleteOrganization,
} from '../../access-management/organizations/organization-utils';
import { createEdaCredential, deleteEdaCredential } from '../credentials/credentials-utils';
import {
  createDecisionEnvironment,
  deleteDecisionEnvironment,
} from '../decision-environments/decision-environments-utils';
import { createEdaEventStream, deleteEdaEventStream } from '../event-streams/event-stream-utils';
import { createEdaProject, deleteEdaProject } from '../projects/projects-utils';
import { createRulebookActivation, deleteRulebookActivation } from './rulebook-activations-utils';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

// Skip all tests if running on SaaS deployment
test.beforeAll(async ({ request }) => {
  const buildType = await checkBuildType(request);
  if (buildType === SAAS_URL) {
    test.skip();
  }
});

test.describe('Rulebook Activations', () => {
  let organizationName: string;
  let projectName: string;
  let credentialName: string;
  let decisionEnvironmentName: string;

  test.beforeEach(async ({ page }) => {
    organizationName = await createOrganization(page);
    projectName = await createEdaProject({ organizationName: organizationName }, page);
    credentialName = await createEdaCredential({ organizationName: organizationName }, page);
    decisionEnvironmentName = await createDecisionEnvironment(
      { organizationName: organizationName },
      page
    );
  });

  test.afterEach(async ({ page }) => {
    await deleteDecisionEnvironment(decisionEnvironmentName, page);
    await deleteEdaCredential(credentialName, page);
    await deleteEdaProject(projectName, page);
    await deleteOrganization(organizationName, page).catch(() => {});
  });

  test.describe('Create', () => {
    test(
      'can create a rulebook activation and assert info on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(300000);

        const rulebookActivationName = await createRulebookActivation(
          {
            projectName: projectName,
            credentialName: credentialName,
            decisionEnvironmentName: decisionEnvironmentName,
            organizationName: organizationName,
          },
          page
        );
        await expect(page.locator('#name')).toHaveValue(rulebookActivationName);
        await expect(page.locator('#project')).toContainText(projectName);
        await expect(page.getByLabel('Label group category').getByRole('listitem')).toContainText(
          credentialName
        );
        await deleteRulebookActivation(rulebookActivationName, page);
      }
    );

    test(
      'can create with restart policy and restart from list view',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);

        const rulebookActivationName = await createRulebookActivation(
          {
            projectName: projectName,
            credentialName: credentialName,
            organizationName: organizationName,
            decisionEnvironmentName: decisionEnvironmentName,
            restartPolicy: 'Always',
          },
          page
        );
        await expect(page.locator('#name')).toHaveValue(rulebookActivationName);
        await expect(page.locator('#restart-policy')).toContainText('Always');
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
        await deleteRulebookActivation(rulebookActivationName, page);
      }
    );
  });

  test.describe('Edit', () => {
    test(
      'can edit a rulebook activation from the list view and assert info on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);
        const rulebookActivationName = await createRulebookActivation(
          {
            projectName: projectName,
            credentialName: credentialName,
            decisionEnvironmentName: decisionEnvironmentName,
            organizationName: organizationName,
          },
          page
        );
        await page.waitForTimeout(1000);
        await page.getByText('Rulebook activation enabled').click();
        await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await page.getByRole('button', { name: 'Disable rulebook activations' }).click();
        await expect(page.getByRole('dialog')).toContainText('Success');
        await expect(page.getByRole('heading', { name: rulebookActivationName })).toBeVisible();
        await page.getByRole('tab', { name: 'Back to Rulebook Activations' }).click();
        await page.getByRole('textbox', { name: 'Type to filter' }).fill(rulebookActivationName);
        await page.getByRole('button', { name: 'apply filter' }).click();
        await expectRowToContain(rulebookActivationName, 'Stopped', page, 30000);
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
        await deleteRulebookActivation(rulebookActivationName, page);
      }
    );

    test(
      'can edit a rulebook activation from the details view and assert info on details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);
        const rulebookActivationName = await createRulebookActivation(
          {
            projectName: projectName,
            credentialName: credentialName,
            decisionEnvironmentName: decisionEnvironmentName,
            organizationName: organizationName,
          },
          page
        );
        await page.waitForTimeout(1000);
        await page.getByText('Rulebook activation enabled').click();
        await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await page.getByRole('button', { name: 'Disable rulebook activations' }).click();
        await expect(page.getByRole('dialog')).toContainText('Success');
        await expect(page.getByText('Rulebook activation enabled')).toBeVisible();
        await expect(page.getByText('Stopped', { exact: true })).toContainText('Stopped', {
          timeout: 30000,
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
        await deleteRulebookActivation(rulebookActivationName, page);
      }
    );

    test(
      'can edit a rulebook activation with source-event stream mapping from the details view and assert info on the details page',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(300000);
        const eventStreamOne = await createEdaEventStream(
          { organizationName: organizationName },
          page
        );
        const eventStreamTwo = await createEdaEventStream(
          { organizationName: organizationName },
          page
        );
        const rulebookActivationName = await createRulebookActivation(
          {
            projectName: projectName,
            credentialName: credentialName,
            disabled: true,
            organizationName: organizationName,
            decisionEnvironmentName: decisionEnvironmentName,
          },
          page
        );
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
        await deleteRulebookActivation(rulebookActivationName, page);
        await deleteEdaEventStream(eventStreamOne, page);
        await deleteEdaEventStream(eventStreamTwo, page);
      }
    );

    test(
      'can edit a rulebook activation with event source mapping and change the rulebook',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(300000);
        const eventStreamOne = await createEdaEventStream(
          { organizationName: organizationName },
          page
        );
        const rulebookActivationName = await createRulebookActivation(
          {
            projectName: projectName,
            credentialName: credentialName,
            disabled: true,
            organizationName: organizationName,
            decisionEnvironmentName: decisionEnvironmentName,
          },
          page
        );
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
        await deleteRulebookActivation(rulebookActivationName, page);
        await deleteEdaEventStream(eventStreamOne, page);
      }
    );
  });

  test.describe('Duplicate', () => {
    test(
      'can duplicate an activation and get a warning when enabling it without changes',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(150000);
        const rulebookActivationName = await createRulebookActivation(
          {
            projectName: projectName,
            credentialName: credentialName,
            organizationName: organizationName,
            decisionEnvironmentName: decisionEnvironmentName,
          },
          page
        );
        await expect(page.locator('#name')).toHaveValue(rulebookActivationName);
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
          page.getByRole('dialog', { name: 'Enable rulebook activation' })
        ).toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Enable rulebook activation' })
        ).toBeVisible();
        await expect(page.getByText('Note: This warning is')).toBeVisible();
        await page.getByRole('button', { name: 'Enable rulebook activation' }).click();
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
});
