import { test } from '@playwright/test';
import { awxLogin } from '../commands/awx/awxLogin';
import { createAwxOrganization } from '../commands/awx/createAwxOrganization';
import { createAwxProject } from '../commands/awx/createAwxProject';
import { deleteAwxOrganization } from '../commands/awx/deleteAwxOrganization';
import { deleteAwxProject } from '../commands/awx/deleteAwxProject';

test.beforeEach(async ({ page }) => {
  await awxLogin(page);
});

test('should be able to create a project and delete a project', async ({ page }) => {
  const organizationName = await createAwxOrganization(page);
  const projectName = await createAwxProject(page, { organizationName });
  await deleteAwxProject(page, projectName);
  await deleteAwxOrganization(page, organizationName);
});
