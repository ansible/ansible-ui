import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { isEdaAvailable } from '@ansible/playwright/commands/getPlatformApis';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  DecisionEnvironment,
  EdaProject,
  Organization,
  RulebookActivation,
} from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

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
    'should access rule audit data for a successful rulebook activation',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);
      const organizationName = await Organization.ui.create(page);
      const projectName = await EdaProject.ui.create(page);
      const decisionEnvironmentName = await DecisionEnvironment.ui.create(page, {
        organizationName,
      });

      const rulebookActivationResponsePromise = page.waitForResponse(
        (response) =>
          response.url().includes('/activations/') &&
          response.request().method() === 'POST' &&
          response.status() === 201
      );

      const rulebookActivationName = await RulebookActivation.ui.create(page, {
        projectName,
        decisionEnvironmentName,
        organizationName,
      });

      const rulebookActivationResponse = await rulebookActivationResponsePromise;
      const rulebookActivation = (await rulebookActivationResponse.json()) as { id: number };

      // Check if workers are available before waiting for completion
      const workersAvailable = await RulebookActivation.api.checkWorkersAvailable(
        page,
        rulebookActivation.id
      );
      if (!workersAvailable) {
        test.skip(true, 'EDA workers are not available - skipping test');
        return;
      }

      await RulebookActivation.api.waitForStatus(page, rulebookActivation.id, 'completed');

      await navigateTo(page, 'Automation Decisions', 'Rule Audit');
      await expect(page.getByRole('heading', { name: 'Rule Audit', exact: true })).toBeVisible();

      await clickTableRow(
        { text: 'Say Hello', filterLabel: 'Activation', filterValue: rulebookActivationName },
        page
      );

      await expect(page.getByRole('heading', { level: 1 })).toContainText('Say Hello');
      await expect(page.locator('#rulebook-activation')).toContainText(rulebookActivationName);

      await page.getByRole('tab', { name: 'Events' }).click();

      const eventsResponse = await page.waitForResponse(
        (response) =>
          response.url().includes('/audit-rules/') &&
          response.url().includes('/events/') &&
          response.status() === 200
      );

      const eventsData = (await eventsResponse.json()) as { results: unknown[]; count: number };
      const event = eventsData.results[0] as { source_name: string };

      const eventRow = await getTableRow(page, event.source_name);
      await eventRow.getByTestId('name-column-cell').locator('a').click();

      await expect(page.getByRole('heading', { name: 'Event details' })).toBeVisible();
      await expect(page.getByTestId('name').getByText(event.source_name)).toBeVisible();
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
