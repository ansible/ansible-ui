import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../../../commands/setup';
import {
  createExecutionEnvironment,
  deleteExecutionEnvironment,
} from './execution-environment-utils';

test.beforeEach(setupBefore({ path: '/execution/infrastructure/execution-environments' }));
test.afterEach(setupAfter);

test('execution environment - create and delete', async ({ page }) => {
  const executionEnvName = await createExecutionEnvironment(page);
  await deleteExecutionEnvironment(executionEnvName, page);
});
