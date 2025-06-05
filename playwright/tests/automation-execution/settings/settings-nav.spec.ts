import { test } from '@playwright/test';
import { navigateTo } from '../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../commands/setup';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Automation Execution settings nav', () => {
  test('should navigate to Controller specific settings', { tag: [] }, async ({ page }) => {
    // the 'navigateTo' helper function already includes an assertion of the page title for the navigated page
    await navigateTo(page, 'Settings', 'Automation Execution', 'System');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Job');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Logging');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Troubleshooting');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Policy');
  });
});
