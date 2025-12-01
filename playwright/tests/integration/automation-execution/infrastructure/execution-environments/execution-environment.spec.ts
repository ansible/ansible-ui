import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { ExecutionEnvironment } from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/execution-environments' }));
test.afterEach(setupAfter);

test('execution environment - create and delete', async ({ page }) => {
  const executionEnvName = await ExecutionEnvironment.ui.create(page);
  await ExecutionEnvironment.ui.delete(page, executionEnvName);
});
