import { expect, test } from '@playwright/test';
import { navigateTo } from '../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { randomString } from '../../../upgrades-tests/utils/random-string';
import {
  createJobTemplate,
  deleteJobTemplate,
  runJobTemplate,
} from '../templates/job-template-utils';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

// This test is taking a long time because of SWR caching and the fact that the dropdown,
// uses SWR infinite loading which seems to be caching old values
test.skip('domains of interest', { tag: [] }, async ({ page }) => {
  test.setTimeout(2 * 60 * 1000);

  // Create Job Template A with label A
  const labelA = randomString(12);
  const jobTemplateAName = await createJobTemplate({ labels: [labelA] }, page);

  // Create Job Template B with label B
  const labelB = randomString(12);
  const jobTemplateBName = await createJobTemplate({ labels: [labelB] }, page);

  // Create Domains
  await navigateTo(page, 'Automation Execution', 'Templates');
  await page.getByText('Configure Domains', { exact: true }).click();

  // Add Domain A for Label A
  const domainA = randomString(12);
  await page.getByRole('button', { name: 'Add Domain' }).click();
  await page.getByLabel('Name *').fill(domainA);
  await page.getByPlaceholder('Select labels').click();
  await page.getByRole('option', { name: labelA }).click();
  await page.getByLabel('Collapse').click();

  // Add Domain B for label B
  const domainB = randomString(12);
  await page.getByText('Configure Domains', { exact: true }).click();
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
  await runJobTemplate(jobTemplateAName, { doNotWait: true }, page);
  await runJobTemplate(jobTemplateBName, { doNotWait: true }, page);

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

  // Clean up Job Templates
  await deleteJobTemplate(jobTemplateAName, page);
  await deleteJobTemplate(jobTemplateBName, page);
});
