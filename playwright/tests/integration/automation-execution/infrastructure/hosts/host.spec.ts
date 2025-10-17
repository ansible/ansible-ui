import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../../../commands/setup';
import { createInventory, deleteInventory } from '../inventories/inventory-utils';
import { createHost, deleteHost } from './host-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/hosts' }));
test.afterEach(setupAfter);

test('host - create and delete', async ({ page }) => {
  const inventoryName = await createInventory({}, page);
  const hostName = await createHost({ inventoryName: inventoryName }, page);
  await deleteHost(hostName, page);
  await deleteInventory(inventoryName, page);
});
