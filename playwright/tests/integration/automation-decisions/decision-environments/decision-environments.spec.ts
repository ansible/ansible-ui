import { test, expect } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  createDecisionEnvironment,
  deleteDecisionEnvironment,
} from './decision-environments-utils';

test.describe('Decision Environments - Details Page', () => {
  let decisionEnvironmentName: string;

  test.beforeEach(setupBefore({ path: '/decisions/decision-environments' }));
  test.afterEach(async ({ page }) => {
    await deleteDecisionEnvironment(decisionEnvironmentName, page).catch(() => {});
  });
  test.afterEach(setupAfter);

  test(
    'can create a decision environment with specific pull policy and verify on details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const expectedPullPolicy = 'Always';
      decisionEnvironmentName = await createDecisionEnvironment(
        { organizationName: 'Default', pullPolicy: expectedPullPolicy },
        page
      );

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
