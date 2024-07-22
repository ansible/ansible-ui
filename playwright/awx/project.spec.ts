import { test } from '@playwright/test';
import { awxLogin } from '../commands/awx/awxLogin';
import { createAwxOrganization } from '../commands/awx/createAwxOrganization';
import { createAwxProject } from '../commands/awx/createAwxProject';
import { deleteAwxOrganization } from '../commands/awx/deleteAwxOrganization';
import { deleteAwxProject } from '../commands/awx/deleteAwxProject';
import { syncAwxProject } from '../commands/awx/syncAwxProject';

test.describe('AWX Project', { tag: ['@awx'] }, () => {
  test.beforeEach(async ({ page }) => {
    await awxLogin(page);
  });

  test('should be able to create, sync, and delete a project', async ({ page }) => {
    // Create an organization
    const organizationName = await createAwxOrganization(page);

    // Create a project
    const projectName = await createAwxProject({ organizationName }, page);

    // Sync the project
    await syncAwxProject(projectName, page);

    // Delete the project
    await deleteAwxProject(projectName, page);

    // Delete the organization
    await deleteAwxOrganization(organizationName, page);
  });
});
