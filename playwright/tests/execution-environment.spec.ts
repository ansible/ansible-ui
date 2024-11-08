import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../commands/setup';
import {
  createExecutionEnvironment,
  deleteExecutionEnvironment,
} from './execution-environment-utils';

test.beforeEach(setupBefore());
test.afterEach(setupAfter);

test('create and delete an execution environment', async ({ page }) => {
  const executionEnvName = await createExecutionEnvironment(page);
  await deleteExecutionEnvironment(executionEnvName, page);
});
