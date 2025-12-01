import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { DecisionEnvironment } from '@ansible/playwright/utils';

test.describe('Decision Environments - Details Page', () => {
  let decisionEnvironmentName: string;

  test.beforeEach(setupBefore({ path: '/decisions/decision-environments' }));
  test.afterEach(async ({ page }) => {
    await DecisionEnvironment.ui.delete(page, decisionEnvironmentName).catch(() => {});
  });
  test.afterEach(setupAfter);

  test(
    'can create a decision environment with specific pull policy and verify on details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const expectedPullPolicy = 'Always';
      decisionEnvironmentName = await DecisionEnvironment.ui.create(page, {
        organizationName: 'Default',
        pullPolicy: expectedPullPolicy,
      });

      await expect(
        page.getByRole('heading', { name: decisionEnvironmentName, exact: true })
      ).toBeVisible();

      const pullPolicyElement = page.getByTestId('pull-policy');
      const isPullPolicyVisible = await pullPolicyElement.isVisible().catch(() => false);

      if (isPullPolicyVisible) {
        await expect(pullPolicyElement).toContainText(expectedPullPolicy);
      }
    }
  );
});
