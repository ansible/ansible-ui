import { expect, test } from '@playwright/test';
import { isEdaAvailable } from '@ansible/playwright/commands/getPlatformApis';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  Organization,
  DecisionEnvironment,
  EdaProject,
  RulebookActivation,
} from '@ansible/playwright/utils';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

test.beforeAll(async ({ request }) => {
  // Check if EDA is available before running EDA-related tests
  const edaAvailable = await isEdaAvailable(request);
  if (!edaAvailable) {
    test.skip();
  }
});

test.describe('Rule Audit List', () => {
  test(
    'can access rule audit data for a successful rulebook activation',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const organizationName = await Organization.ui.create(page);
      const projectName = await EdaProject.ui.create(page);
      const decisionEnvironmentName = await DecisionEnvironment.ui.create(page, {
        organizationName,
      });
      const rulebookActivationName = await RulebookActivation.ui.create(page, {
        projectName,
        decisionEnvironmentName,
        organizationName,
      });

      // Wait for the rulebook activation to run and generate audit data
      await page.waitForTimeout(5000);

      await navigateTo(page, 'Automation Decisions', 'Rule Audit');
      await expect(page.getByRole('heading', { name: 'Rule Audit', exact: true })).toBeVisible();

      await page.getByTestId('filter').click();
      await page.getByRole('option', { name: 'Activation' }).click();

      await page.getByRole('textbox', { name: 'Type to filter' }).fill(rulebookActivationName);

      await expect(page.locator('tbody tr')).toHaveCount(1, { timeout: 120000 });
      const ruleRow = page.getByRole('row').filter({ hasText: rulebookActivationName });
      await ruleRow.getByRole('link').first().click();

      await expect(page.getByRole('heading', { level: 1 })).toContainText('Say Hello');
      await expect(page.locator('#rulebook-activation')).toContainText(rulebookActivationName);

      await page.getByRole('tab', { name: 'Events' }).click();

      // Wait for events table to load and verify events are displayed
      await expect(page.getByRole('grid')).toBeVisible();

      // Click on the link in the Name column to open event details
      await page.locator('td[data-label="Name"] a').first().click();
      await expect(page.getByRole('heading', { name: 'Event details' })).toBeVisible();
      await expect(page.getByTestId('name').getByText('ansible.eda.range')).toBeVisible();
      await page.getByRole('contentinfo').getByRole('button', { name: 'Close' }).click();
      await page.getByRole('tab', { name: 'Actions' }).click();
      await expect(page.getByRole('row').filter({ hasText: 'debug' })).toBeVisible();

      await RulebookActivation.ui.delete(page, rulebookActivationName);
      await EdaProject.ui.delete(page, projectName);
      await DecisionEnvironment.ui.delete(page, decisionEnvironmentName);
      await Organization.ui.delete(page, organizationName);
    }
  );
});
