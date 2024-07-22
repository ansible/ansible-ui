import { test } from '@playwright/test';
import { awxLogin } from '../../commands/awx/awxLogin';
import { createAwxOrganization } from '../../commands/awx/createAwxOrganization';
import { deleteAwxOrganization } from '../../commands/awx/deleteAwxOrganization';

test.describe('AWX Organization', { tag: ['@awx'] }, () => {
  test.beforeEach(async ({ page }) => {
    await awxLogin(page);
  });

  // @redundant
  // This test is redundant because other tests already test the functionality
  // such as the team and project tests.
  // We still want to keep it to show how to create and delete an organization
  // but we tag it as redundant so it is not run by pull requests.
  test(
    'should be able to create and delete an organization',
    { tag: ['@redundant'] },
    async ({ page }) => {
      // Create an organization
      const organizationName = await createAwxOrganization(page);

      // Delete the organization
      await deleteAwxOrganization(organizationName, page);
    }
  );
});
