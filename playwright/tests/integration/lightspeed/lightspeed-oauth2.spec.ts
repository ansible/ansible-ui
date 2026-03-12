import { expect, test } from '@playwright/test';
import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { AZURE_URL, SAAS_URL } from '@ansible/playwright/commands/constants';
import { setupAfter } from '@ansible/playwright/commands/setup';

const userName = process.env.PLATFORM_USERNAME ?? '';
const userPassword = process.env.PLATFORM_PASSWORD ?? '';
const lightspeedServer = process.env.LIGHTSPEED_SERVER ?? '';

test.describe('Ansible Lightspeed oauth2', () => {
  test.afterEach(setupAfter);

  test(
    'should authenticate to lightspeed via oauth2 successfully',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.skip(!lightspeedServer, 'LIGHTSPEED_SERVER not supplied');
      test.skip(!userName, 'PLATFORM_USERNAME not supplied');
      test.skip(!userPassword, 'PLATFORM_PASSWORD not supplied');

      const buildType = await checkBuildType(page);
      test.skip(
        buildType === SAAS_URL || buildType === AZURE_URL,
        'Test should not run on SaaS/Azure deployment'
      );

      await page.goto(lightspeedServer);

      await page.getByRole('link', { name: 'Log in', exact: true }).click();

      await page.getByRole('link', { name: 'Log in with Ansible Automation Platform' }).click();

      await page.getByRole('textbox', { name: 'Username' }).fill(userName);

      await page.getByLabel('Password *').fill(userPassword);

      await page.getByRole('button', { name: 'Log in' }).click();

      await page.getByRole('button', { name: 'Authorize' }).click();

      await expect(page.getByText(userName, { exact: true })).toBeVisible();

      await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
    }
  );
});
