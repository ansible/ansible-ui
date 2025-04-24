import { test } from '@playwright/test';
import { setupAfter, setupBefore } from '../../../commands/setup';
import { navigateTo } from '../../../commands/navigateTo';
import { hasFeatureFlag } from '../../util/featureFlags';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Automation Execution settings nav', () => {
  test('should navigate to Controller specific settings', { tag: [] }, async ({ page }) => {
    // the 'navigateTo' helper function already includes an assertion of the page title for the navigated page
    await navigateTo(page, 'Settings', 'Automation Execution', 'System');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Job');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Logging');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Troubleshooting');
    const hasPolicyAsCode = await hasFeatureFlag(page, 'FEATURE_POLICY_AS_CODE_ENABLED');
    if (!hasPolicyAsCode) {
      return;
    }
    await navigateTo(page, 'Settings', 'Automation Execution', 'Policy');
  });
});
