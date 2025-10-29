import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../../../../commands/setup';
import { createInventorySource, deleteInventory, deleteInventorySource } from '../inventory-utils';
import { createAwxProject, deleteAwxProject } from '../../../projects/project-utils';
import {
  createOrganization,
  deleteOrganization,
} from '../../../../access-management/organizations/organization-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test.describe('Inventory Source', () => {
  test('can create and delete inventory source', { tag: ['@not_mock'] }, async ({ page }) => {
    const organizationName = await createOrganization(page);
    const projectName = await createAwxProject({ organizationName }, page);
    const { inventorySourceName, inventoryName } = await createInventorySource(
      { organizationName, projectName },
      page
    );
    await deleteInventorySource(inventoryName, inventorySourceName, page);
    await deleteInventory(inventoryName, page);
    await deleteAwxProject(projectName, page);
    await deleteOrganization(organizationName, page);
  });
});
