import { test } from '@playwright/test';
import { awxLogin } from '../../commands/awx/awxLogin';
import { createAwxOrganization } from '../../commands/awx/createAwxOrganization';
import { createAwxTeam } from '../../commands/awx/createAwxTeam';
import { deleteAwxOrganization } from '../../commands/awx/deleteAwxOrganization';
import { deleteAwxTeam } from '../../commands/awx/deleteAwxTeam';

test.describe('AWX Team', { tag: ['@awx'] }, () => {
  test.beforeEach(async ({ page }) => {
    await awxLogin(page);
  });

  test('should be able to create and delete a team', async ({ page }) => {
    // Create an organization
    const organizationName = await createAwxOrganization(page);

    // Create a team
    const teamName = await createAwxTeam({ organizationName }, page);

    // Delete the team
    await deleteAwxTeam(teamName, page);

    // Delete the organization
    await deleteAwxOrganization(organizationName, page);
  });
});
