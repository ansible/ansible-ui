import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createJobTemplate, deleteJobTemplate, runJobTemplate } from './job-template-utils';
import { navigateTo } from '../../../commands/navigateTo';
import { selectTableFilter } from '../../../commands/selectTableFilter';
import { filterTableBySelect } from '../../../commands/filterTableBySelect';
import { clearTableFilters } from '../../../commands/clearTableFilters';

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
