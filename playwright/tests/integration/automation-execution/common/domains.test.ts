import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Inventory, JobTemplate } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';
import { randomString } from '../../../../../framework/utils/random-string';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

// This test is taking a long time because of SWR caching and the fact that the dropdown,
// uses SWR infinite loading which seems to be caching old values
test('domains of interest', { tag: [] }, async ({ page }) => {
  test.setTimeout(2 * 60 * 1000);

  const inventoryName = await Inventory.ui.create(page);

  // Create Job Template A with label A
  const labelA = randomString(12);
  const jobTemplateAName = await JobTemplate.ui.create(page, {
    labels: [labelA],
    createLabel: true,
    inventoryName: inventoryName,
  });

  // Create Job Template B with label B
  const labelB = randomString(12);
  const jobTemplateBName = await JobTemplate.ui.create(page, {
    labels: [labelB],
    createLabel: true,
    inventoryName: inventoryName,
  });

  // Create Domains
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByRole('button', { name: 'Configure Domains' }).click();

  // Add Domain A for Label A
  const domainA = randomString(12);
  await page.getByRole('button', { name: 'Add Domain' }).click();
  await page.getByLabel('Name *').fill(domainA);
  await page.getByPlaceholder('Select labels').click();
  await page.getByRole('option', { name: labelA }).click();
  await page.getByLabel('Collapse').click();

  // Add Domain B for label B
  const domainB = randomString(12);
  await page.getByRole('button', { name: 'Add Domain' }).click();
  await page.getByLabel('Name *').fill(domainB);
  await page.getByPlaceholder('Select labels').click();
  await page.getByRole('option', { name: labelB }).click();
  await page.getByLabel('Collapse').click();

  // Save Domains
  await page.getByRole('button', { name: 'Submit' }).click();

  // Verify Domains Work for Job Templates
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByLabel('table view', { exact: true }).click();

  // Enable Domain A for Job Templates
  await page.getByRole('button', { name: domainA }).click();
  await expect(page.getByRole('main')).toContainText(jobTemplateAName);
  await expect(page.getByRole('main')).not.toContainText(jobTemplateBName);

  // Enable Domain B for Job Templates
  await page.getByRole('button', { name: domainB }).click();
  await expect(page.getByRole('main')).toContainText(jobTemplateAName);
  await expect(page.getByRole('main')).toContainText(jobTemplateBName);

  // Disable Domain A for Job Templates
  await page.getByRole('button', { name: domainA }).click();
  await expect(page.getByRole('main')).toContainText(jobTemplateBName);
  await expect(page.getByRole('main')).not.toContainText(jobTemplateAName);

  // Clear Active Domains
  await page.getByRole('button', { name: 'Clear Active Domains' }).click();

  // Run Job Templates so we can verify Domains for Jobs
  await JobTemplate.ui.run(page, jobTemplateAName, { doNotWait: true });
  await JobTemplate.ui.run(page, jobTemplateBName, { doNotWait: true });

  // Verify Domains Work for Jobs
  await navigateTo(page, 'Automation Execution', 'Jobs');

  // Enable Domain A for Jobs
  await page.getByRole('button', { name: domainA }).click();
  await expect(page.getByRole('main')).toContainText(jobTemplateAName);
  await expect(page.getByRole('main')).not.toContainText(jobTemplateBName);

  // Enable Domain B for Jobs
  await page.getByRole('button', { name: domainB }).click();
  await expect(page.getByRole('main')).toContainText(jobTemplateAName);
  await expect(page.getByRole('main')).toContainText(jobTemplateBName);

  // Disable Domain A for Jobs
  await page.getByRole('button', { name: domainA }).click();
  await expect(page.getByRole('main')).toContainText(jobTemplateBName);
  await expect(page.getByRole('main')).not.toContainText(jobTemplateAName);

  // Clear Active Domains
  await page.getByRole('button', { name: 'Clear Active Domains' }).click();

  // Clean up Job Templates (use API to cancel running jobs first)
  await JobTemplate.api.deleteByName(page, jobTemplateAName);
  await JobTemplate.api.deleteByName(page, jobTemplateBName);
  await Inventory.ui.delete(page, inventoryName);
});
