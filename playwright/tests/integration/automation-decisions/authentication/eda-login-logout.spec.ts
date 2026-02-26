import { expect, test } from '@playwright/test';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { login, platformUI } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { User } from '@ansible/playwright/utils';
import { createE2EUsername } from '@ansible/playwright/commands/createE2EName';

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);

test.describe('Platform - Cross-Service User Authentication', () => {
  test(
    'should display linked EDA username after platform login',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const username = 'E2EUser' + createE2EUsername('user');
      const password = 'E2EUserPassword';
      const edaUser = await User.api.create(page, { username, password });

      await test.step('Log out and verify redirect to login page', async () => {
        await logout(page);
        await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible();
      });

      await test.step('Log back in and verify EDA username visibility', async () => {
        await login(page, platformUI, {
          username: edaUser.username,
          password,
        });

        await expect(
          page.getByTestId('toolbar').getByRole('button', { name: edaUser.username, exact: true })
        ).toBeVisible();
      });
    }
  );
});
