import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createInventory, deleteInventory } from './inventory-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test('inventory - create and delete', async ({ page }) => {
  const inventoryName = await createInventory({}, page);
  await deleteInventory(inventoryName, page);
});

//Vidya
test.skip('inventory - can create an inventory, assert info on details page, and delete inventory', async () => {
  //to-do
});

//Vidya
test.skip('inventory - can edit an inventory from the list view and assert info on details page', async () => {
  //to-do
});

//Vidya
test.skip('inventory - can edit an inventory from the details view and assert info on details page', async () => {
  //to-do
});

//Kersom
test.skip('inventory - can copy an inventory on the details view and assert that the copy has been successful', async () => {
  //to-do
});

//Kersom
test.skip('inventory - can copy an inventory on the list view and assert that the copy has been successful', async () => {
  //to-do
});

//Kersom
test.skip('inventory - can delete an inventory from the inventory list row item', async () => {
  //to-do
});

//Pratyush
test.skip('inventory - can delete an inventory from the inventory list toolbar', async () => {
  //to-do
});

//Pratyush
test.skip('inventory - can bulk delete inventories from the list view and verify deletion', async () => {
  //to-do
});

//Pratyush
test.skip('inventory - can create, edit a smart inventory, assert info on details page, and delete inventory', async () => {
  //to-do
});
