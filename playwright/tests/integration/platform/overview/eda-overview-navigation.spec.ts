import { test, expect } from '@playwright/test';
import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Platform EDA Overview - Navigation', () => {
  test(
    'user can navigate to resource pages using View all links from Platform Dashboard',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await expect(page.getByTestId('page-title')).toContainText(
        'Welcome to the Ansible Automation Platform'
      );

      // Test navigation to Decision Environments
      const decisionEnvironmentsLink = page.getByRole('link', {
        name: 'View all Decision Environments',
        exact: true,
      });
      await decisionEnvironmentsLink.scrollIntoViewIfNeeded();
      await decisionEnvironmentsLink.click();

      await expect(
        page.getByRole('heading', { name: 'Decision Environments', exact: true }).first()
      ).toBeVisible();

      // Navigate back to platform overview
      await page.locator('#platform-overview').click();
      await expect(page.getByTestId('page-title')).toContainText(
        'Welcome to the Ansible Automation Platform'
      );

      // Test navigation to Rulebook Activations
      const rulebookActivationsLink = page.getByRole('link', {
        name: 'View all Rulebook Activations',
        exact: true,
      });
      await rulebookActivationsLink.scrollIntoViewIfNeeded();
      await rulebookActivationsLink.click();

      await expect(
        page.getByRole('heading', { name: 'Rulebook Activations', exact: true }).first()
      ).toBeVisible();

      // Navigate back to platform overview
      await page.locator('#platform-overview').click();
      await expect(page.getByTestId('page-title')).toContainText(
        'Welcome to the Ansible Automation Platform'
      );

      // Test navigation to Rule Audit
      const ruleAuditLink = page.getByRole('link', {
        name: 'View all Rule Audit',
        exact: true,
      });
      await ruleAuditLink.scrollIntoViewIfNeeded();
      await ruleAuditLink.click();

      await expect(
        page.getByRole('heading', { name: 'Rule Audit', exact: true }).first()
      ).toBeVisible();
    }
  );
});
