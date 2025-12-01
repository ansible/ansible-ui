import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { InstanceGroup } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/inventories' }));
test.afterEach(setupAfter);

test('instance group - create and delete', async ({ page }) => {
  const instanceGroupName = await InstanceGroup.ui.create(page);
  await InstanceGroup.ui.delete(page, instanceGroupName);
});
