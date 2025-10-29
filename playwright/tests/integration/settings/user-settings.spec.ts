import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('User Settings', () => {
  test('should be able to change user preferences', { tag: ['@not_mock'] }, async ({ page }) => {
    await navigateTo(page, 'Settings', 'User Preferences');
    await expect(page.getByRole('heading', { name: 'User Preferences' })).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await singleSelectByLabel('Table layout', 'Compact', page);

    await page.getByText('Save user preferences').click();

    await expect(page.getByTestId('tablelayout')).toContainText('Compact');

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await singleSelectByLabel('Table layout', 'Comfortable', page);
    await page.getByText('Save user preferences').click();

    await expect(page.getByTestId('tablelayout')).toContainText('Comfortable');
  });
});
