import { expect, test } from '@playwright/test';
import { isEdaAvailable } from '../../../../commands/getPlatformApis';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import {
  createOrganization,
  deleteOrganization,
} from '../../access-management/organizations/organization-utils';
import {
  createDecisionEnvironment,
  deleteDecisionEnvironment,
} from '../decision-environments/decision-environments-utils';
import { createEdaProject, deleteEdaProject } from '../projects/projects-utils';
import { createRulebookActivation, deleteRulebookActivation } from './rulebook-activations-utils';

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
      const organizationName = await createOrganization(page);
      const projectName = await createEdaProject({}, page);
      const { decisionEnvironmentName } = await createDecisionEnvironment(
        { organizationName: organizationName },
        page
      );
      const rulebookActivationName = await createRulebookActivation(
        {
          projectName: projectName,
          decisionEnvironmentName: decisionEnvironmentName,
          organizationName: organizationName,
        },
        page
      );

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

      await deleteRulebookActivation(rulebookActivationName, page);
      await deleteEdaProject(projectName, page);
      await deleteDecisionEnvironment(decisionEnvironmentName, page);
      await deleteOrganization(organizationName, page);
    }
  );
});
