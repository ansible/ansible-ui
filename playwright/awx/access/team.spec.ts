import { test } from '@playwright/test';
import { awxLogin } from '../../commands/awx/awxLogin';
import { createAwxOrganization } from '../../commands/awx/createAwxOrganization';
import { createAwxTeam } from '../../commands/awx/createAwxTeam';
import { deleteAwxOrganization } from '../../commands/awx/deleteAwxOrganization';
import { deleteAwxTeam } from '../../commands/awx/deleteAwxTeam';

test.beforeEach(async ({ page }) => {
  await awxLogin(page);
});

test('should be able to create a team and delete a team', { tag: ['@awx'] }, async ({ page }) => {
  const organizationName = await createAwxOrganization(page);
  const teamName = await createAwxTeam(page, { organizationName });
  await deleteAwxTeam(page, teamName);
  await deleteAwxOrganization(page, organizationName);
});
