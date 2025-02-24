import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createAwxProject, syncAwxProject, deleteAwxProject } from './project-utils';

test.beforeEach(setupBefore({ path: '/execution/projects' }));
test.afterEach(setupAfter);

test('project - create, sync, and delete', async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const projectName = await createAwxProject({}, page);
  await syncAwxProject(projectName, page);
  await deleteAwxProject(projectName, page);
});
