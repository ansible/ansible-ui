import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createOrganization, deleteOrganization } from './organization-utils';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test('organization - create and delete', async ({ page }) => {
  const organizationName = await createOrganization(page);
  await deleteOrganization(organizationName, page);
});
