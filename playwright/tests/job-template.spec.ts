import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createJobTemplate, deleteJobTemplate, runJobTemplate } from './job-template-utils';

test.beforeEach(setupBefore);
test.afterEach(setupAfter);

test('create, run, and delete a job template', { tag: ['@not-mock'] }, async ({ page }) => {
  const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;
  if (mockEnabled) return; // Does not yet work in mock

  const jobTemplateName = await createJobTemplate({}, page);
  await runJobTemplate(jobTemplateName, page);
  await deleteJobTemplate(jobTemplateName, page);
});
