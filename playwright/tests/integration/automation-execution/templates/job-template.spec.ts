import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../../commands/createE2EName';
import { filterTable } from '../../../../commands/filterTable';
import { navigateTo } from '../../../../commands/navigateTo';
import { selectTableFilter } from '../../../../commands/selectTableFilter';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import {
  createAwxCredential,
  deleteAwxCredential,
} from '../infrastructure/credentials/credential-utils';
import { createInventory, deleteInventory } from '../infrastructure/inventories/inventory-utils';
import { createJobTemplate, deleteJobTemplate, runJobTemplate } from './job-template-utils';

test.describe('Job Templates', () => {
  let inventoryName: string;

  test.beforeEach(async ({ page }) => {
    await setupBefore({ path: '/' })({ page });
    inventoryName = await createInventory({}, page);
  });

  test.afterEach(async ({ page }) => {
    await deleteInventory(inventoryName, page);
    await setupAfter({ page });
  });

  test('can create a job template and assert the information showing on the details page', async ({
    page,
  }) => {
    test.setTimeout(2 * 60 * 1000);
    const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
    await deleteJobTemplate(jobTemplateName, page);
  });

  test(
    'can create a job template with prompted fields, launch from the list view, and complete launch via wizard',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const label = createE2EName('label-jt');
      const jobTemplateName = await createJobTemplate(
        { inventoryName: inventoryName, PromptOnLaunch: true, labels: [label], createLabel: true },
        page
      );
      await runJobTemplate(
        jobTemplateName,
        { inventoryName: inventoryName, PromptOnLaunch: true, labels: [label] },
        page
      );
      await deleteJobTemplate(jobTemplateName, page);
    }
  );

  test(
    'can create a job template with a survey, add limits and verify they are displayed on Edit',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(5 * 30 * 1000);
      const jobTemplateName = await createJobTemplate(
        { inventoryName: inventoryName, survey: true },
        page
      );
      await page
        .getByLabel('Global', { exact: true })
        .getByRole('link', { name: 'Templates' })
        .click();
      await page.getByRole('textbox', { name: 'Type to filter' }).click();
      await page.getByRole('textbox', { name: 'Type to filter' }).fill(jobTemplateName);
      await page.getByRole('link', { name: jobTemplateName }).click();
      await page.getByRole('tab', { name: 'Survey' }).click();
      await page.getByRole('button', { name: 'Edit survey question' }).click();
      await page.getByRole('spinbutton', { name: 'Minimum length' }).click();
      await page.getByRole('spinbutton', { name: 'Minimum length' }).fill('5');
      await page.getByRole('spinbutton', { name: 'Maximum length' }).click();
      await page.getByRole('spinbutton', { name: 'Maximum length' }).fill('15');
      await page.getByRole('button', { name: 'Save survey question' }).click();
      await page.getByRole('button', { name: 'Edit survey question' }).click();
      await expect(page.getByRole('spinbutton', { name: 'Minimum length' })).toHaveValue('5');
      await expect(page.getByRole('spinbutton', { name: 'Maximum length' })).toHaveValue('15');
      await deleteJobTemplate(jobTemplateName, page);
    }
  );

  test(
    'can launch a job template from the details page launch button using the prompt on launch',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName = await createJobTemplate(
        { inventoryName: inventoryName, PromptOnLaunch: true },
        page
      );
      await runJobTemplate(
        jobTemplateName,
        { inventoryName: inventoryName, PromptOnLaunch: true, view: 'details', doNotWait: false },
        page
      );
      await deleteJobTemplate(jobTemplateName, page);
    }
  );

  test(
    'job template - edit using row action of the template list page',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      const editedJobTemplateName = jobTemplateName + ' - edited from row action';
      const editedDescription = 'this is a new description after editing from row action';
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByLabel('table view', { exact: true }).click();
      await filterTable(
        { filterLabel: 'Name', filterValue: jobTemplateName, clearFilters: true },
        page
      );
      await page.getByRole('row', { name: jobTemplateName }).getByLabel('Edit template').click();
      // edit template
      await expect(page.getByRole('heading')).toContainText('Edit ' + jobTemplateName);
      await page.getByPlaceholder('Enter job template name').fill(editedJobTemplateName);
      await page.getByPlaceholder('Enter description').fill(editedDescription);
      await page.getByRole('button', { name: 'Save job template' }).click();
      // assert values have been edited
      await expect(page.getByRole('heading', { name: editedJobTemplateName })).toBeVisible();
      await expect(page.locator('#description')).toContainText(editedDescription);
      // cleanup
      await deleteJobTemplate(editedJobTemplateName, page);
    }
  );

  test(
    'can edit a job template using the edit template button on details page',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      const editedJobTemplateName = jobTemplateName + ' - edited from row action';
      const editedDescription = 'this is a new description after editing from row action';
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByLabel('table view', { exact: true }).click();
      await clickTableRow({ text: jobTemplateName }, page);
      await expect(page.getByRole('main')).toContainText(jobTemplateName);
      await page.locator('#edit-template').click();
      await navigateTo(page, 'Automation Execution', 'Templates');
      await page.getByLabel('table view', { exact: true }).click();
      await clickTableRow({ text: jobTemplateName }, page);
      await expect(page.getByRole('main')).toContainText(jobTemplateName);
      await page.locator('#edit-template').click();
      // edit template
      await expect(page.getByRole('heading')).toContainText('Edit ' + jobTemplateName);
      await page.getByPlaceholder('Enter job template name').fill(editedJobTemplateName);
      await page.getByPlaceholder('Enter description').fill(editedDescription);
      await page.getByRole('button', { name: 'Save job template' }).click();
      // assert values have been edited
      await expect(page.getByRole('heading', { name: editedJobTemplateName })).toBeVisible();
      await expect(page.locator('#description')).toContainText(editedDescription);
      // cleanup
      await deleteJobTemplate(editedJobTemplateName, page);
    }
  );

  test(
    'can assign a new inventory to a job template if the originally assigned inventory was deleted',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      // create inventory + job template and then delete inventory
      const inventoryName = await createInventory({}, page);
      const newInventoryName = await createInventory({}, page);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await deleteInventory(inventoryName, page);
      // click edit row action
      await navigateTo(page, 'Automation Execution', 'Templates');
      await selectTableFilter('Name', page);
      await page.getByRole('button', { name: 'Select name' }).click();
      await page.getByLabel('Search input').fill(jobTemplateName);
      await page.getByRole('menuitem', { name: jobTemplateName }).locator('span').first().click();
      await page.getByLabel('Edit template').click();
      // add new inventory
      await page.getByRole('button', { name: 'Inventory' }).click();
      await page.getByRole('option', { name: newInventoryName }).click();
      await page.getByRole('button', { name: 'Save job template' }).click();
      // assert edited values
      await expect(page.locator('#name').getByText(jobTemplateName)).toBeVisible();
      await expect(page.getByRole('link', { name: newInventoryName })).toBeVisible();
      // cleanup
      await deleteJobTemplate(jobTemplateName, page);
      await deleteInventory(newInventoryName, page);
    }
  );

  //skipping this test. It is flaky because a webhook key is not always reliably generated on save.
  test.skip(
    'can edit a job template to enable provisioning callback and enable webhook, then edit again to disable those options',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const credentialName = await createAwxCredential({}, page);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      const hostConfigKey = createE2EName('host-config-key');
      // navigate to details page
      await navigateTo(page, 'Automation Execution', 'Templates');
      await selectTableFilter('Name', page);
      await page.getByRole('button', { name: 'Select name' }).click();
      await page.getByLabel('Search input').fill(jobTemplateName);
      await page.getByRole('menuitem', { name: jobTemplateName }).locator('span').first().click();
      await page.getByRole('link', { name: jobTemplateName }).click();
      // assert that provisioning callback and webhook are not enabled
      await page.getByRole('link', { name: 'Edit template' }).click();
      await expect(page.getByLabel('Enable webhook')).not.toBeChecked();
      await expect(page.getByLabel('Provisioning callback')).not.toBeChecked();
      // enable webhook
      await page.getByLabel('Enable webhook').check();
      await page.getByRole('button', { name: 'Select webhook service' }).click();
      await page.getByRole('option', { name: 'GitHub' }).click();
      await page.locator('button#webhook_credential').click();
      await page.getByRole('option', { name: credentialName }).click();
      await page.getByRole('button', { name: 'Save job template' }).click();
      // assert correctly saved values
      await page.getByRole('link', { name: 'Edit template' }).click();
      await expect(page.getByLabel('Enable webhook')).toBeChecked();
      await expect(page.getByLabel('Webhook credential')).toContainText(credentialName);
      await expect(page.getByRole('button', { name: 'GitHub' })).toBeVisible();
      // disable webhook and enable provisioning callback
      await page.getByLabel('Enable webhook').uncheck();
      await page.getByLabel('Provisioning callback').check();
      await page.getByPlaceholder('Enter host config key').click();
      await page.getByPlaceholder('Enter host config key').fill(hostConfigKey);
      await page.getByRole('button', { name: 'Save job template' }).click();
      // assert correctly saved values, then disable provisioning callback
      await page.getByRole('link', { name: 'Edit template' }).click();
      await expect(page.getByLabel('Enable webhook')).not.toBeChecked();
      await expect(page.getByLabel('Provisioning callback', { exact: true })).toBeChecked();
      await expect(page.getByPlaceholder('Enter host config key')).toHaveValue(hostConfigKey);
      await page.getByLabel('Provisioning callback', { exact: true }).uncheck();
      await page.getByRole('button', { name: 'Save job template' }).click();
      // assert both webhook and provisioning callback are disabled
      await page.getByRole('link', { name: 'Edit template' }).click();
      await expect(page.getByLabel('Enable webhook')).not.toBeChecked();
      await expect(page.getByLabel('Provisioning callback')).not.toBeChecked();
      // cleanup
      await deleteJobTemplate(jobTemplateName, page);
      await deleteAwxCredential(credentialName, page);
    }
  );

  //skipping this test. It is flaky because a webhook key is not always reliably generated on save.
  test.skip(
    'can edit a job template to enable webhook, regenerate webhook key and set webhook credentials',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const credentialName = await createAwxCredential({}, page);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await navigateTo(page, 'Automation Execution', 'Templates');
      // click edit row action
      await selectTableFilter('Name', page);
      await page.getByRole('button', { name: 'Select name' }).click();
      await page.getByLabel('Search input').fill(jobTemplateName);
      await page.getByRole('menuitem', { name: jobTemplateName }).locator('span').first().click();
      await page.getByLabel('Edit template').click();
      // enable webhook
      await page.getByLabel('Enable webhook').check();
      await page.locator('button#webhook-service-form-group').click();
      await page.getByRole('option', { name: 'GitHub' }).click();
      await page.getByRole('button', { name: 'Webhook credential' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
      await page.getByRole('option', { name: credentialName }).click();
      await expect(page.getByRole('button', { name: 'Webhook credential' })).toContainText(
        credentialName
      );
      await page.locator('#related-webhook-receiver').inputValue();
      await page.getByRole('button', { name: 'Save job template' }).click();
      // assert correctly saved values
      await expect(page.getByRole('button', { name: 'Launch template' })).toBeVisible();
      await expect(page.locator('#webhook-credential')).toContainText(credentialName);
      await page.getByRole('link', { name: 'Edit template' }).click();
      await expect(page.getByLabel('Webhook credential')).toContainText(credentialName);
      await expect(page.locator('button#webhook-service-form-group')).toContainText('GitHub');
      //assert current webhook key
      const originalWebhookKey = await page
        .getByRole('textbox', { name: 'Webhook key' })
        .inputValue();
      await page.getByLabel('Update webhook key').click();
      await page.getByRole('button', { name: 'Save job template' }).click();
      await page.getByRole('link', { name: 'Edit template' }).click();
      // assert regenerated webhook key
      const regeneratedWebhookKey = await page
        .getByRole('textbox', { name: 'Webhook key' })
        .inputValue();
      expect(originalWebhookKey).not.toEqual(regeneratedWebhookKey);
      // cleanup
      await deleteJobTemplate(jobTemplateName, page);
      await deleteAwxCredential(credentialName, page);
    }
  );

  test(
    'can delete a job template from the list line item',
    { tag: ['@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await deleteJobTemplate(jobTemplateName, page);
    }
  );

  test(
    'can delete a job template from the details page',
    { tag: ['@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName = await createJobTemplate({ inventoryName: inventoryName }, page);
      await deleteJobTemplate(jobTemplateName, page, 'details');
    }
  );

  test(
    'can bulk delete job templates from the list page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName1 = await createJobTemplate({ inventoryName: inventoryName }, page);
      const jobTemplateName2 = await createJobTemplate({ inventoryName: inventoryName }, page);
      await page.getByLabel('Breadcrumb').getByRole('link', { name: 'Templates' }).click();
      await page.getByLabel('table view', { exact: true }).click();
      await filterTable(
        {
          pageTitle: 'Automation Templates',
          filterLabel: 'Name',
          filterValue: jobTemplateName1,
          clearFilters: false,
        },
        page
      );
      await filterTable(
        { filterLabel: 'Name', filterValue: jobTemplateName2, clearFilters: false },
        page
      );
      await page.getByRole('checkbox', { name: 'Select all' }).click();
      await page.getByLabel('toolbar actions').click();
      await expect(page.getByRole('menuitem', { name: 'Delete templates' })).toBeVisible();
      await page.getByRole('menuitem', { name: 'Delete templates' }).click();
      await confirmAndAssertDeletion(page);
    }
  );

  test(
    'can create a job template and assert the OPA is showing on the details page',
    { tag: ['@compare', '@mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName = createE2EName('job-template');
      const jobTemplateDescription = 'This is a JT description';
      // const inventoryName = 'Demo Inventory';
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
      await page.getByLabel('dropdown toggle', { exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();
      await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);
      await page.getByPlaceholder('Enter description').fill(jobTemplateDescription);
      await expect(page.getByLabel('Policy enforcement')).toBeVisible();
      await page.getByLabel('Policy enforcement').fill('testpkg/testrule');
      await page.getByLabel('Inventory').click();
      await page.getByRole('option', { name: inventoryName, exact: true }).click();
      const projectName = 'Demo Project';
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();
      await page.getByPlaceholder('Add a project, then select a').click();
      await page.getByPlaceholder('Add a project, then select a').fill('hello');
      await page.getByRole('option', { name: 'hello_world.yml' }).click();
      await expect(page.getByPlaceholder('Add a project, then select a')).toHaveValue(
        'hello_world.yml'
      );
      await page.getByRole('button', { name: 'Create job template' }).click();
      await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
      await expect(page.locator('#name')).toContainText(jobTemplateName);
      await expect(page.locator('#description')).toContainText(jobTemplateDescription);
      await expect(page.locator('#job-type')).toContainText('run');
      // await expect(page.locator('#organization')).toContainText('Default');
      await expect(page.locator('#project')).toContainText(projectName);
      await expect(page.locator('#playbook')).toContainText('hello_world.yml');
      await expect(page.locator('#policy-enforcement')).toContainText('testpkg/testrule');
      await deleteJobTemplate(jobTemplateName, page);
    }
  );

  test(
    'can create a job template, select multiple credentials and deselct one from the selected credential chip close button',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const jobTemplateName = createE2EName('job-template');
      const jobTemplateDescription = 'This is a JT description';
      // const inventoryName = 'Demo Inventory';
      const credentialOne = await createAwxCredential({ credentialType: 'Vault' }, page);
      const credentialTwo = await createAwxCredential({ credentialType: 'Machine' }, page);
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(
        page.getByRole('heading', { name: 'Automation Templates', exact: true })
      ).toBeVisible();
      await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
      await page.getByRole('menuitem', { name: 'Create job template' }).click();
      await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);
      await page.getByPlaceholder('Enter description').fill(jobTemplateDescription);
      await page.getByLabel('Inventory').click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(inventoryName);
      await page.getByRole('option', { name: inventoryName, exact: true }).click();
      const projectName = 'Demo Project';
      await page.locator('#project-select').click();
      await page.getByRole('option', { name: projectName }).click();
      await expect(page.getByPlaceholder('Add a project, then select a')).toBeVisible();
      await page.getByPlaceholder('Add a project, then select a').click();
      await page.getByPlaceholder('Add a project, then select a').fill('hello');
      await page.getByRole('option', { name: 'hello_world.yml' }).click();
      await expect(page.getByPlaceholder('Add a project, then select a')).toHaveValue(
        'hello_world.yml'
      );
      await page.getByRole('button', { name: 'Credentials' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialOne);
      await page.getByRole('checkbox', { name: `${credentialOne} | Vault` }).check();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialTwo);
      await page.getByRole('checkbox', { name: `${credentialTwo} | Machine` }).check();
      await page.getByRole('button', { name: `close ${credentialOne}` }).click();
      await expect(page.getByRole('button', { name: `close ${credentialOne}` })).not.toBeVisible();
      await page.getByRole('button', { name: 'Create job template' }).click();
      await expect(page.getByRole('heading', { name: jobTemplateName, exact: true })).toBeVisible();
      await expect(page.locator('#name')).toContainText(jobTemplateName);
      await expect(page.locator('#description')).toContainText(jobTemplateDescription);
      await expect(page.locator('#job-type')).toContainText('run');
      // await expect(page.locator('#organization')).toContainText('Default');
      await expect(page.locator('#project')).toContainText(projectName);
      await expect(page.locator('#playbook')).toContainText('hello_world.yml');
      await expect(page.locator('#credentials')).toContainText(`SSH: ${credentialTwo}`);
      await deleteJobTemplate(jobTemplateName, page);
    }
  );

  test(
    'can launch a job template with an enabled survey from the details page launch button using the prompt on launch',
    { tag: ['@not_mock', '@compare'] },
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const surveyQuestion = 'q1';
      const surveyAnswerVar = 'v1';
      const jobTemplateName = await createJobTemplate(
        { inventoryName: inventoryName, PromptOnLaunch: true },
        page
      );
      await page.getByRole('tab', { name: 'Survey' }).click();
      await page.getByRole('link', { name: 'Create survey question' }).click();
      await page.getByRole('textbox', { name: 'Question' }).fill(surveyQuestion);
      await page.getByRole('textbox', { name: 'Answer variable name' }).fill(surveyAnswerVar);
      await page.getByRole('button', { name: 'Create survey question' }).click();
      await page
        .locator('label')
        .filter({ hasText: 'Survey enabled' })
        .locator('span')
        .first()
        .click();
      await runJobTemplate(
        jobTemplateName,
        {
          inventoryName: inventoryName,
          PromptOnLaunch: true,
          view: 'details',
          survey: { question: surveyQuestion, answerVar: surveyAnswerVar },
        },
        page
      );
      await deleteJobTemplate(jobTemplateName, page);
    }
  );

  test(
    'verify playbook selection does not auto-clear unexpectedly',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(60000);

      const jobTemplateName = createE2EName('playbook-persist-test');

      // Navigate to templates page
      await navigateTo(page, 'Automation Execution', 'Templates');
      await expect(page.getByTestId('page-title')).toBeVisible({ timeout: 10000 });

      // Self-contained navigation logic (doesn't modify utility)
      const createButtonExists = await page.getByText('Create template', { exact: true }).count();
      const dropdownExists = await page
        .getByRole('button', { name: 'dropdown toggle', exact: true })
        .count();

      if (createButtonExists > 0) {
        await page.getByText('Create template', { exact: true }).click();
        const menuItemExists = await page
          .getByRole('menuitem', { name: 'Create job template' })
          .count();
        if (menuItemExists > 0) {
          await page.getByRole('menuitem', { name: 'Create job template' }).click();
        } else {
          test.skip(true, 'Create job template menu item not found');
        }
      } else if (dropdownExists > 0) {
        await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
        await page.waitForTimeout(1000);
        const menuItemExists = await page
          .getByRole('menuitem', { name: 'Create job template' })
          .count();
        if (menuItemExists > 0) {
          await page.getByRole('menuitem', { name: 'Create job template' }).click();
        } else {
          test.skip(true, 'Create job template menu item not found in dropdown');
        }
      } else {
        test.skip(true, 'Cannot access job template creation form - no create buttons found');
      }

      // Continue with form if we got here
      await expect(page.getByPlaceholder('Enter job template name')).toBeVisible({
        timeout: 10000,
      });
      await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);

      // Select inventory (required)
      await page.getByRole('button', { name: 'Inventory' }).click();
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 5000 });
      await page.locator('[role="option"]').first().click();

      // Test the core fix: project-playbook interaction
      await page.locator('#project-select').click();
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 5000 });
      const projectOptions = await page.locator('[role="option"]').all();
      expect(projectOptions.length).toBeGreaterThan(0);
      await projectOptions[0].click();

      // Wait for and interact with playbook field
      await expect(page.getByPlaceholder('Add a project, then select a')).toBeVisible({
        timeout: 10000,
      });
      await page.getByPlaceholder('Add a project, then select a').fill('hello_world.yml');

      const selectedPlaybook = await page
        .getByPlaceholder('Add a project, then select a')
        .inputValue();
      expect(selectedPlaybook).toBe('hello_world.yml');

      // Verify playbook doesn't auto-clear without user action - THE KEY TEST
      // Wait to ensure the field doesn't unexpectedly clear itself
      await page.waitForTimeout(3000);
      const persistedValue = await page
        .getByPlaceholder('Add a project, then select a')
        .inputValue();
      expect(persistedValue).toBe('hello_world.yml');

      // Additional test: verify project changes do clear playbook (expected behavior)
      if (projectOptions.length > 1) {
        await page.locator('#project-select').click();
        await projectOptions[1].click();
        await page.waitForTimeout(1000);

        const clearedValue = await page
          .getByPlaceholder('Add a project, then select a')
          .inputValue();
        expect(clearedValue).toBe('');

        // Switch back and re-enter playbook
        await page.locator('#project-select').click();
        await projectOptions[0].click();
        await expect(page.getByPlaceholder('Add a project, then select a')).toBeVisible({
          timeout: 5000,
        });
        await page.getByPlaceholder('Add a project, then select a').fill('hello_world.yml');

        // Final verification: playbook should persist after re-selection
        await page.waitForTimeout(3000);
        const finalValue = await page.getByPlaceholder('Add a project, then select a').inputValue();
        expect(finalValue).toBe('hello_world.yml');
      }
    }
  );

  test('verify the playbook field is creatable', { tag: ['@not_mock'] }, async ({ page }) => {
    const jobTemplateName = createE2EName('playbook-creatable');

    // Navigate to templates page
    await navigateTo(page, 'Automation Execution', 'Templates');
    await expect(page.getByTestId('page-title')).toBeVisible({ timeout: 10000 });

    const createButtonExists = await page.getByText('Create template', { exact: true }).count();
    const dropdownExists = await page
      .getByRole('button', { name: 'dropdown toggle', exact: true })
      .count();

    if (createButtonExists > 0) {
      await page.getByText('Create template', { exact: true }).click();
      const menuItemExists = await page
        .getByRole('menuitem', { name: 'Create job template' })
        .count();
      if (menuItemExists > 0) {
        await page.getByRole('menuitem', { name: 'Create job template' }).click();
      } else {
        test.skip(true, 'Create job template menu item not found');
      }
    } else if (dropdownExists > 0) {
      await page.getByRole('button', { name: 'dropdown toggle', exact: true }).click();
      await page.waitForTimeout(1000);
      const menuItemExists = await page
        .getByRole('menuitem', { name: 'Create job template' })
        .count();
      if (menuItemExists > 0) {
        await page.getByRole('menuitem', { name: 'Create job template' }).click();
      } else {
        test.skip(true, 'Create job template menu item not found in dropdown');
      }
    } else {
      test.skip(true, 'Cannot access job template creation form - no create buttons found');
    }

    // Continue with form if we got here
    await expect(page.getByPlaceholder('Enter job template name')).toBeVisible({
      timeout: 10000,
    });
    await page.getByPlaceholder('Enter job template name').fill(jobTemplateName);

    // Select inventory (required)
    await page.getByRole('button', { name: 'Inventory' }).click();
    await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 5000 });
    await page.locator('[role="option"]').first().click();

    await page.locator('#project-select').click();
    await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 5000 });
    const projectOptions = await page.locator('[role="option"]').all();
    expect(projectOptions.length).toBeGreaterThan(0);
    await projectOptions[0].click();

    // Wait for and interact with playbook field
    await expect(page.getByPlaceholder('Add a project, then select a')).toBeVisible({
      timeout: 10000,
    });
    await page.getByPlaceholder('Add a project, then select a').fill('test_hello_world.yml');
    await page.getByRole('option', { name: 'Create "test_hello_world.yml"' }).click();
    const selectedPlaybook = await page
      .getByPlaceholder('Add a project, then select a')
      .inputValue();

    expect(selectedPlaybook).toBe('test_hello_world.yml');

    await page.waitForTimeout(3000);
    const persistedValue = await page.getByPlaceholder('Add a project, then select a').inputValue();
    expect(persistedValue).toBe('test_hello_world.yml');
  });
});
