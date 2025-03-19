import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../commands/clickTableRow';
import { expectRowToContain } from '../../../commands/expectRowToContain';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createEdaCredential, deleteEdaCredential } from '../credentials/credentials-utils';
import { createEdaProject, deleteEdaProject } from '../projects/projects-utils';
import { createRulebookActivation, deleteRulebookActivation } from './rulebook-activations-utils';
import { createEdaEventStream, deleteEdaEventStream } from '../event-streams/event-stream-utils';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

test(
  'rulebook activations - can create a rulebook activation and assert info on details page',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    test.setTimeout(150000);
    const newProject = await createEdaProject({}, page);
    const newCredential = await createEdaCredential({}, page);
    const rulebookActivationName = await createRulebookActivation(
      { projectName: newProject, credentialName: newCredential },
      page
    );
    await expect(page.locator('#name')).toContainText(rulebookActivationName);
    await expect(page.locator('#project')).toContainText(newProject);
    await expect(page.getByLabel('Label group category').getByRole('listitem')).toContainText(
      newCredential
    );
    await deleteRulebookActivation(rulebookActivationName, page);
    await deleteEdaProject(newProject, page);
    await deleteEdaCredential(newCredential, page);
  }
);

test(
  'rulebook activations - can edit a rulebook activation from the list view and assert info on details page',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    test.setTimeout(150000);
    const newProject = await createEdaProject({}, page);
    const newCredential = await createEdaCredential({}, page);
    const rulebookActivationName = await createRulebookActivation(
      { projectName: newProject, credentialName: newCredential },
      page
    );
    await page.getByText('Rulebook activation enabled').click();
    await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
    await page.getByRole('button', { name: 'Disable rulebook activations' }).click();
    await expect(page.locator('[data-ouia-component-type="PF5/ModalContent"]')).toContainText(
      'Success'
    );
    await expect(page.locator('label')).toContainText('Rulebook activation disabled');
    await page.getByRole('tab', { name: 'Back to Rulebook Activations' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(rulebookActivationName);
    await page.getByRole('button', { name: 'apply filter' }).click();
    await expectRowToContain(rulebookActivationName, 'Stopped', page, 15000);
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
    await expect(page.locator('#description')).toContainText('edited description');
    await expect(page.locator('#enabled-option')).toContainText('Skip audit events');
    await deleteRulebookActivation(rulebookActivationName, page);
    await deleteEdaProject(newProject, page);
    await deleteEdaCredential(newCredential, page);
  }
);

test(
  'rulebook activations - can edit a rulebook activation from the details view and assert info on details page',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    test.setTimeout(150000);
    const newProject = await createEdaProject({}, page);
    const newCredential = await createEdaCredential({}, page);
    const rulebookActivationName = await createRulebookActivation(
      { projectName: newProject, credentialName: newCredential },
      page
    );
    await page.getByText('Rulebook activation enabled').click();
    await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
    await page.getByRole('button', { name: 'Disable rulebook activations' }).click();
    await expect(page.locator('[data-ouia-component-type="PF5/ModalContent"]')).toContainText(
      'Success'
    );
    await expect(page.locator('label')).toContainText('Rulebook activation disabled');
    await expect(page.getByText('Stopped', { exact: true })).toContainText('Stopped', {
      timeout: 15000,
    });
    await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('edited description');
    await page.getByRole('checkbox', { name: 'Skip audit events' }).check();
    await page.getByRole('button', { name: 'Save rulebook activation' }).click();
    await expect(page.locator('#description')).toContainText('edited description');
    await expect(page.locator('#enabled-option')).toContainText('Skip audit events');
    await deleteRulebookActivation(rulebookActivationName, page);
    await deleteEdaProject(newProject, page);
    await deleteEdaCredential(newCredential, page);
  }
);

test(
  'rulebook activations - can edit a rulebook activation  with source-event stream mapping from the details view and assert info on the details page',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    test.setTimeout(150000);
    const newProject = await createEdaProject({}, page);
    const newCredential = await createEdaCredential({}, page);
    const eventStreamOne = await createEdaEventStream({}, page);
    const eventStreamTwo = await createEdaEventStream({}, page);
    const rulebookActivationName = await createRulebookActivation(
      { projectName: newProject, credentialName: newCredential },
      page
    );
    await page.getByText('Rulebook activation enabled').click();
    await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
    await page.getByRole('button', { name: 'Disable rulebook activations' }).click();
    await expect(page.locator('label')).toContainText('Rulebook activation disabled');
    await expect(page.getByText('Stopped', { exact: true })).toContainText('Stopped', {
      timeout: 30000,
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
    await deleteRulebookActivation(rulebookActivationName, page);
    await deleteEdaProject(newProject, page);
    await deleteEdaCredential(newCredential, page);
    await deleteEdaEventStream(eventStreamOne, page);
    await deleteEdaEventStream(eventStreamTwo, page);
  }
);
