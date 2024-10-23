import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createHost, deleteHost } from './host-utils';
import { createInventory, deleteInventory } from './inventory-utils';

test.beforeEach(setupBefore);
test.afterEach(setupAfter);

test('create and delete a host', async ({ page }) => {
  const inventoryName = await createInventory({}, page);
  const hostName = await createHost({ inventoryName }, page);
  await deleteHost(hostName, page);
  await deleteInventory(inventoryName, page);
});
