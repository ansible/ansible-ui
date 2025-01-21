import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createInstanceGroup, deleteInstanceGroup } from './instance-group-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test('instance group - create and delete', async ({ page }) => {
  const instanceGroupName = await createInstanceGroup({}, page);
  await deleteInstanceGroup(instanceGroupName, page);
});
