import { test } from '@playwright/test';
import { awxLogin } from '../../commands/awx/awxLogin';
import { createAwxOrganization } from '../../commands/awx/createAwxOrganization';
import { deleteAwxOrganization } from '../../commands/awx/deleteAwxOrganization';

test.beforeEach(async ({ page }) => {
  await awxLogin(page);
});

test(
  'should be able to create an organization and delete an organization',
  { tag: ['@awx'] },
  async ({ page }) => {
    const organizationName = await createAwxOrganization(page);
    await deleteAwxOrganization(page, organizationName);
  }
);
