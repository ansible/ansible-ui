import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createJobTemplate, deleteJobTemplate, runJobTemplate } from './job-template-utils';

test.beforeEach(setupBefore({ path: '/execution/templates' }));
test.afterEach(setupAfter);

test('job template - create, run, and delete', { tag: ['@not_mock'] }, async ({ page }) => {
  // if (page.mock.enabled) return; // Does not yet work in mock
  const jobTemplateName = await createJobTemplate({}, page);
  await runJobTemplate(jobTemplateName, page);
  await deleteJobTemplate(jobTemplateName, page);
});
