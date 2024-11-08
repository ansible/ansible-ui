import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createOrganization, deleteOrganization } from './organization-utils';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test('create and delete an organization', async ({ page }) => {
  const organizationName = await createOrganization(page);
  await deleteOrganization(organizationName, page);
});
