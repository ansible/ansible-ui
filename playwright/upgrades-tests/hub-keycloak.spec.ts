import { expect, test } from '@playwright/test';
import { randomString } from '../../framework/utils/random-string';
import { login, platformUI } from '../commands/login';
import { logout } from '../commands/logout';
import { setupAfter } from '../commands/setup';
import { mock } from '../mock/mock';
import { UpgradeUserType } from '../utils/constants';
import { getUserForMigration } from '../utils/getUserForMigration';

let hubKeyCloakUser: { username: string; password: string };

let controllerUser: { username: string; password: string };

test.beforeEach(mock);
test.beforeEach(async ({ page }) => {
  const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;
  // Get a user to test with
  if (!mockEnabled) {
    // Login as administrator
    await login(page);
    // Get credentials of an unmigrated keycloak user
    hubKeyCloakUser = await getUserForMigration({
      userType: UpgradeUserType.hubKeycloak,
      request: page.request, // page.request: API testing helper associated with this page
    });
    // Get credentials of an unmigrated controller user
    controllerUser = (await getUserForMigration({
      userType: UpgradeUserType.controllerLegacy,
      request: page.request, // page.request: API testing helper associated with this page
    })) as { username: string; password: string };
    // Logout as administrator
    await logout(page);
  }
});

test.afterEach(setupAfter);

test(
  'Log in using Hub OIDC Keycloak account, link accounts and be directed to the Platform UI dashboard',
  { tag: ['@upgrade', '@not_e2e'] },
  async ({ page }) => {
    const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;

    await page.goto(platformUI);
    await page.getByRole('link', { name: 'I have an Automation Hub account' }).click();
    await page.getByRole('link', { name: 'Keycloak' }).click();

    if (!mockEnabled) {
      // use the real keycloak and hub login pages
      await page.getByLabel('Username or email').fill(hubKeyCloakUser?.username);
      await page.getByLabel('Password', { exact: true }).fill(hubKeyCloakUser?.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    await expect(page.getByText('Link your Ansible Automation')).toBeVisible();

    await page
      .getByLabel('Link your Automation Controller account')
      .getByLabel('Username')
      .fill(controllerUser?.username || 'controller_user');
    await page
      .getByLabel('Link your Automation Controller account')
      .getByLabel('Password')
      .fill(controllerUser?.password || 'controller_pw');

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Username').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('h1')).toContainText('Welcome to the Ansible Automation Platform');
  }
);

test(
  'Link additional accounts from User Details page',
  { tag: ['@upgrade', '@not_e2e'] },
  async ({ page }) => {
    const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;

    await page.goto(platformUI);
    await page.getByRole('link', { name: 'I have an Automation Hub account' }).click();
    await page.getByRole('link', { name: 'Keycloak' }).click();

    if (!mockEnabled) {
      // use the real keycloak and hub login pages
      await page.getByLabel('Username or email').fill(hubKeyCloakUser?.username);
      await page.getByLabel('Password', { exact: true }).fill(hubKeyCloakUser?.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    await expect(page.getByText('Link your Ansible Automation')).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Username').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('h1')).toContainText('Welcome to the Ansible Automation Platform');

    await page.getByRole('button', { name: hubKeyCloakUser?.username || 'mock' }).click();
    await page.getByRole('menuitem', { name: 'User details' }).click();
    await page.getByLabel('kebab dropdown toggle').click();
    await page.getByRole('menuitem', { name: 'Link user accounts' }).click();
    await page
      .getByLabel('Link your Automation Controller account')
      .getByLabel('Username')
      .fill(controllerUser?.username || 'controller_user');
    await page.getByLabel('Password').fill(controllerUser?.password || 'controller_pw');
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Linked', exact: true }).first()).toBeVisible();
  }
);

// Since the assertions in the following tests occur within the Keycloak UI, they are not applicable for testing against the mock API
test.describe('Negative paths for hub Keycloak authentication', () => {
  test(
    'fails to authenticate with incorrect password',
    { tag: ['@upgrade', '@not_e2e', '@not_mock'] },
    async ({ page }) => {
      const erroneousPassword = 'E2Epass ' + randomString(4);
      const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;

      await page.goto(platformUI);
      await page.getByRole('link', { name: 'I have an Automation Hub account' }).click();
      await page.getByRole('link', { name: 'Keycloak' }).click();

      if (!mockEnabled) {
        // use the real keycloak and hub login pages
        await page.getByLabel('Username or email').fill(hubKeyCloakUser?.username);
        await page.getByLabel('Password', { exact: true }).fill(erroneousPassword);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('Invalid username or password.')).toBeVisible();
      }
    }
  );
  test(
    'fails to authenticate with a user that does not exist',
    { tag: ['@upgrade', '@not_e2e'] },
    async ({ page }) => {
      const nonExistentUsername = 'E2Euser ' + randomString(4);
      const erroneousPassword = 'E2Epass ' + randomString(4);
      const mockEnabled = (test.info().project.metadata as { mock?: boolean }).mock;

      await page.goto(platformUI);
      await page.getByRole('link', { name: 'I have an Automation Hub account' }).click();
      await page.getByRole('link', { name: 'Keycloak' }).click();

      if (!mockEnabled) {
        // use the real keycloak and hub login pages
        await page.getByLabel('Username or email').fill(nonExistentUsername);
        await page.getByLabel('Password', { exact: true }).fill(erroneousPassword);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('Invalid username or password.')).toBeVisible();
      }
    }
  );
});
