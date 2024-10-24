import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createHost, deleteHost } from './host-utils';

test.beforeEach(setupBefore);
test.afterEach(setupAfter);

test('create and delete a host', async ({ page }) => {
  const hostName = await createHost({}, page);
  await deleteHost(hostName, page);
});
