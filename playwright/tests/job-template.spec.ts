import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createJobTemplate, deleteJobTemplate, runJobTemplate } from './job-template-utils';

test.beforeEach(setupBefore);
test.afterEach(setupAfter);

test('create, run, and delete a job template', { tag: ['@not-mock'] }, async ({ page }) => {
  const jobTemplateName = await createJobTemplate({}, page);
  await runJobTemplate(jobTemplateName, page);
  await deleteJobTemplate(jobTemplateName, page);
});
