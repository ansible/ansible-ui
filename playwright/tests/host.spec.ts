import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createHost, deleteHost } from './host-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/hosts' }));
test.afterEach(setupAfter);

test('host - create and delete', async ({ page }) => {
  const hostName = await createHost({}, page);
  await deleteHost(hostName, page);
});
