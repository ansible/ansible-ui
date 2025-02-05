import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createJobTemplate, deleteJobTemplate, runJobTemplate } from './job-template-utils';
import { navigateTo } from '../../../commands/navigateTo';
import { selectTableFilter } from '../../../commands/selectTableFilter';
import { filterTableBySelect } from '../../../commands/filterTableBySelect';
import { clearTableFilters } from '../../../commands/clearTableFilters';
import { createInventory, deleteInventory } from '../infrastructure/inventories/inventory-utils';
import {
  createAwxCredential,
  deleteAwxCredential,
} from '../infrastructure/credentials/credential-utils';
import { createE2EName } from '../../../commands/createE2EName';
import { clickTableRowWithFilter } from '../../../commands/clickTableRow';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

test('can create a job template and assert the information showing on the details page', async ({
  page,
}) => {
  const jobTemplateName = await createJobTemplate({}, page);
  await deleteJobTemplate(jobTemplateName, page);
});

test(
  'can create a job template with prompted fields, launch from the list view, and complete launch via wizard',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const jobTemplateName = await createJobTemplate({ PromptOnLaunch: true }, page);
    await runJobTemplate(jobTemplateName, { PromptOnLaunch: true }, page);
    await deleteJobTemplate(jobTemplateName, page);
  }
);

test(
  'can launch a job template from the details page launch button using the prompt on launch',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const jobTemplateName = await createJobTemplate({ PromptOnLaunch: true }, page);
    await runJobTemplate(jobTemplateName, { PromptOnLaunch: true, view: 'details' }, page);
    await deleteJobTemplate(jobTemplateName, page);
  }
);

test(
  'job template - edit using row action of the template list page',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const jobTemplateName = await createJobTemplate({}, page);
    const editedJobTemplateName = jobTemplateName + ' - edited from row action';
    const editedDescription = 'this is a new description after editing from row action';
    await navigateTo(page, 'Automation Execution', 'Templates');
    await page.getByLabel('table view', { exact: true }).click();

    await clearTableFilters(page);
    await page.getByLabel('table view', { exact: true }).click();

    await clearTableFilters(page);
    await selectTableFilter('Name', page);
    await filterTableBySelect(jobTemplateName, page);
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
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const jobTemplateName = await createJobTemplate({}, page);
    const editedJobTemplateName = jobTemplateName + ' - edited from row action';
    const editedDescription = 'this is a new description after editing from row action';
    await navigateTo(page, 'Automation Execution', 'Templates');
    await page.getByLabel('table view', { exact: true }).click();

    await clickTableRowWithFilter(jobTemplateName, page);
    await expect(page.getByRole('main')).toContainText(jobTemplateName);
    await page.locator('#edit-template').click();

    await navigateTo(page, 'Automation Execution', 'Templates');
    await page.getByLabel('table view', { exact: true }).click();

    await clickTableRowWithFilter(jobTemplateName, page);
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
  { tag: ['@not_mock'] },
  async ({ page }) => {
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
    await page.getByPlaceholder('Select inventory').fill(newInventoryName);
    await page.getByRole('option', { name: newInventoryName }).click();
    await page.getByRole('button', { name: 'Save job template' }).click();

    // assert edited values
    await expect(page.getByRole('heading', { name: jobTemplateName })).toBeVisible();
    await expect(page.locator('#inventory')).toContainText(newInventoryName);

    // cleanup
    await deleteJobTemplate(jobTemplateName, page);
    await deleteInventory(newInventoryName, page);
  }
);

test(
  'can edit a job template to enable provisioning callback and enable webhook, then edit again to disable those options',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const credentialName = await createAwxCredential({}, page);
    const jobTemplateName = await createJobTemplate({}, page);
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
    await page.locator('button#webhook-service-form-group').click();
    await page.getByRole('option', { name: 'GitHub' }).click();
    await page.locator('button#webhook_credential').click();
    await page.getByRole('option', { name: credentialName }).click();
    await page.getByRole('button', { name: 'Save job template' }).click();

    // assert correctly saved values
    await page.getByRole('link', { name: 'Edit template' }).click();
    await expect(page.getByLabel('Enable webhook')).toBeChecked();
    await expect(page.getByLabel('Webhook credential')).toContainText(credentialName);
    await expect(page.locator('button#webhook-service-form-group')).toContainText('GitHub');

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

test(
  'can edit a job template to enable webhook, regenerate webhook key and set webhook credentials',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const credentialName = await createAwxCredential({}, page);
    const jobTemplateName = await createJobTemplate({}, page);

    await navigateTo(page, 'Automation Execution', 'Templates');
    // click edit row action
    await navigateTo(page, 'Automation Execution', 'Templates');
    await selectTableFilter('Name', page);
    await page.getByRole('button', { name: 'Select name' }).click();
    await page.getByLabel('Search input').fill(jobTemplateName);
    await page.getByRole('menuitem', { name: jobTemplateName }).locator('span').first().click();
    await page.getByLabel('Edit template').click();

    // enable webhook
    await page.getByLabel('Enable webhook').check();
    await page.locator('button#webhook-service-form-group').click();
    await page.getByRole('option', { name: 'GitHub' }).click();
    await page.locator('button#webhook_credential').click();
    await page.getByRole('option', { name: credentialName }).click();
    await page.getByRole('button', { name: 'Save job template' }).click();

    // assert correctly saved values
    await expect(page.getByRole('heading')).toContainText(jobTemplateName);
    await expect(page.locator('#webhook-credential')).toContainText(credentialName);
    await page.getByRole('link', { name: 'Edit template' }).click();
    await expect(page.getByLabel('Webhook credential')).toContainText(credentialName);
    await expect(page.locator('button#webhook-service-form-group')).toContainText('GitHub');

    //assert current webhook key
    const originalWebhookKey = await page.getByLabel('Webhook key', { exact: true }).inputValue();
    await page.getByLabel('Update webhook key').click();
    await page.getByRole('button', { name: 'Save job template' }).click();
    await page.getByRole('link', { name: 'Edit template' }).click();

    // assert regenerated webhook key
    const regeneratedWebhookKey = await page
      .getByLabel('Webhook key', { exact: true })
      .inputValue();

    expect(originalWebhookKey).not.toEqual(regeneratedWebhookKey);

    // cleanup
    await deleteJobTemplate(jobTemplateName, page);
    await deleteAwxCredential(credentialName, page);
  }
);

test('can delete a job template from the list line item', async ({ page }) => {
  const jobTemplateName = await createJobTemplate({}, page);
  await deleteJobTemplate(jobTemplateName, page);
});

test('can delete a job template from the details page', async ({ page }) => {
  const jobTemplateName = await createJobTemplate({}, page);
  await deleteJobTemplate(jobTemplateName, page, 'details');
});

test('can bulk delete job templates from the list page', async ({ page }) => {
  const jobTemplateName1 = await createJobTemplate({}, page);
  const jobTemplateName2 = await createJobTemplate({}, page);
  await navigateTo(page, 'Automation ExecutionAutomation Controller', 'Templates');
  await page.getByLabel('table view', { exact: true }).click();
  await selectTableFilter('Name', page);
  await filterTableBySelect(jobTemplateName1, page);
  await page.getByRole('row', { name: jobTemplateName1 }).getByLabel('Select row').click();
  await clearTableFilters(page);
  await selectTableFilter('Name', page);
  await filterTableBySelect(jobTemplateName2, page);
  await page.getByRole('row', { name: jobTemplateName2 }).getByLabel('Select row').click();
  await page.getByLabel('toolbar actions').click();
  await page.getByRole('menuitem', { name: 'Delete templates' }).click();
  await page.getByText('Yes, I confirm that I want to').click();
  await page.getByRole('button', { name: 'Delete template' }).click();
  await expect(page.locator('[data-ouia-component-type="PF5/ModalContent"]')).toContainText(
    'Success'
  );
  await expect(
    page.getByRole('heading', { name: 'Automation Templates', exact: true })
  ).toBeVisible();
});
