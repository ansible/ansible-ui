import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { Host, Inventory } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/hosts' }));
test.afterEach(setupAfter);

test('host - create and delete', async ({ page }) => {
  const inventoryName = await Inventory.ui.create(page);
  const hostName = await Host.ui.create(page, { inventoryName });
  await Host.ui.delete(page, hostName);
  await Inventory.ui.delete(page, inventoryName);
});
