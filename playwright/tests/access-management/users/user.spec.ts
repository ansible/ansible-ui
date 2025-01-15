import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { createUser, deleteUser } from './user-utils';

test.beforeEach(setupBefore({ path: '/access/users' }));
test.afterEach(setupAfter);

test('user - create and delete', async ({ page }) => {
  const username = await createUser({}, page);
  await deleteUser(username, page);
});
