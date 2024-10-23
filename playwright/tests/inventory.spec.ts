import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import { createInventory, deleteInventory } from './inventory-utils';

test.beforeEach(setupBefore);
test.afterEach(setupAfter);

test('create and delete inventory', async ({ page }) => {
  const inventoryName = await createInventory({}, page);
  await deleteInventory(inventoryName, page);
});
