import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createInventory, deleteInventory } from './inventory-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test('inventory - create and delete', async ({ page }) => {
  const inventoryName = await createInventory({}, page);
  await deleteInventory(inventoryName, page);
});
