import { expect, test } from '@playwright/test';
import { randomString } from '../../framework/utils/random-string';
import { login, platformUI } from '../commands/login';
import { logout } from '../commands/logout';
import { setupAfter } from '../commands/setup';
import { handleRoute } from '../mock/handlers/handleRoute';
import { mock } from '../mock/mock';
import { Router } from '../mock/router/Router';
import { UpgradeUserType } from '../utils/constants';
import { getUserForMigration } from '../utils/getUserForMigration';

let controllerKeyCloakUser: { username: string; password: string };

let hubUser: { username: string; password: string };

test.beforeEach(({ page }) => mock(page));

test.beforeEach(async ({ page }) => {
  // Get a user to test with
  if (!page.mock.enabled) {
    // Login as administrator
    await login(page);
    await expect(page.locator('h1')).toContainText('Welcome to the Ansible Automation Platform');
    // Get credentials of an unmigrated keycloak user
    controllerKeyCloakUser = await getUserForMigration({
      userType: UpgradeUserType.controllerOIDC,
      request: page.request, // page.request: API testing helper associated with this page
    });
    // Get credentials of an unmigrated hub user
    hubUser = (await getUserForMigration({
      userType: UpgradeUserType.hubLegacy,
      request: page.request, // page.request: API testing helper associated with this page
    })) as { username: string; password: string };
    // Logout as administrator
    await logout(page);
  } else {
    // Mock out legacy_controller server
    const mockData = page.mock.data;
    mockData.api.gateway.v1.ui_auth = {
      show_login_form: true,
      passwords: [
        {
          name: 'Local Database Authenticator',
          type: 'ansible_base.authentication.authenticator_plugins.local',
        },
      ],
      ssos: [],
      login_redirect_override: '',
      custom_login_info: '',
      custom_logo: '',
      managed_cloud_install: false,
      legacy_controller_sso_url: 'https://legacy_controller',
      legacy_automation_hub_sso_url: 'https://legacy_hub',
      legacy_auth_enabled: true,
    };

    mockData.api.controller.v2.auth = {
      oidc: {
        login_url: '/sso/login/oidc/',
        complete_url: `https://localhost:4100/sso/complete/oidc/`,
      },
      'saml:keycloak': {
        login_url: '/sso/login/saml/?idp=keycloak',
        complete_url: 'https://localhost:4100/sso/complete/saml/',
        metadata_url: '/sso/metadata/saml/',
      },
    };

    const mockOptions = page.mock.options;

    const legacyControllerRouter = new Router();
    legacyControllerRouter.GET('/sso/login/oidc/', () => {
      mockData.api.gateway.v1.legacy_auth = {
        id: 84,
        username: 'ctlr_oidc_ui_user_1',
        is_authenticated: false,
        needs_rename: false,
        is_migrated: false,
        linked_accounts: [
          {
            service: 3,
            service_type: 'controller',
            original_username: 'ctlr_oidc_ui_user_1',
            user: 84,
            gateway_username: 'ctlr_oidc_ui_user_1',
            ansible_id: 'ac8bb7bb-eaf5-45d0-a126-c249408ab27d',
            backend_classification: null,
          },
        ],
        needs_aap_password: false,
        allow_rename: true,
        allow_aap_password: false,
        is_sso_account: true,
      };
      return {
        status: 301,
        headers: { Location: platformUI },
      };
    });
    await page
      .context()
      .route(`https://legacy_controller/**/*`, (route) =>
        handleRoute(route, legacyControllerRouter, mockData, mockOptions)
      );

    const router = page.mock.router;
    router.POST('/api/gateway/v1/legacy_auth/finalize/', () => {
      const user = {
        id: 1,
        username: 'mock',
        is_superuser: true,
        summary_fields: { resource: { ansible_id: '1' } },
      };
      mockData.api.gateway.v1.me = [user];
      mockData.api.gateway.v1.legacy_auth = {
        id: user.id,
        username: user.username,
        is_authenticated: true,
        needs_rename: false,
        is_migrated: true,
        linked_accounts: [],
      };
      mockData.api.gateway.v1.legacy_auth = {
        id: 84,
        username: 'mock',
        is_authenticated: false,
        needs_rename: false,
        is_migrated: true,
        linked_accounts: [
          {
            service: 3,
            service_type: 'controller',
            original_username: 'mock',
            user: 84,
            gateway_username: 'mock',
            ansible_id: 'ac8bb7bb-eaf5-45d0-a126-c249408ab27d',
            backend_classification: null,
          },
        ],
        needs_aap_password: false,
        allow_rename: true,
        allow_aap_password: false,
        is_sso_account: true,
      };
      return { status: 200, body: {} };
    });
  }
});

test.afterEach(setupAfter);

test(
  'awx keycloak - Log in using Controller OIDC Keycloak account, link accounts and be directed to the Platform UI dashboard',
  { tag: ['@upgrade', '@not_e2e'] },
  async ({ page }) => {
    await page.goto(platformUI);
    await page.getByRole('link', { name: 'I have an Automation Controller account' }).click();
    await page.getByRole('link', { name: 'OIDC' }).click();

    if (!page.mock.enabled) {
      // use the real keycloak and controller login pages
      await page.getByLabel('Username or email').fill(controllerKeyCloakUser?.username);
      await page.getByLabel('Password', { exact: true }).fill(controllerKeyCloakUser?.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    await expect(page.getByText('Link your Ansible Automation')).toBeVisible();

    await page
      .getByLabel('Link your Automation Hub account')
      .getByLabel('Username')
      .fill(hubUser?.username || 'hub_user');
    await page
      .getByLabel('Link your Automation Hub account')
      .getByLabel('Password')
      .fill(hubUser?.password || 'hub_pw');

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Username').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('h1')).toContainText('Welcome to the Ansible Automation Platform');
  }
);

test(
  'awx keycloak - Link additional accounts from User Details page',
  { tag: ['@upgrade', '@not_e2e'] },
  async ({ page }) => {
    await page.goto(platformUI);
    await page.getByRole('link', { name: 'I have an Automation Controller account' }).click();
    await page.getByRole('link', { name: 'OIDC' }).click();

    if (!page.mock.enabled) {
      // use the real keycloak and controller login pages
      await page.getByLabel('Username or email').fill(controllerKeyCloakUser?.username);
      await page.getByLabel('Password', { exact: true }).fill(controllerKeyCloakUser?.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
    }

    await expect(page.getByText('Link your Ansible Automation')).toBeVisible();

    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByLabel('Username').click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.locator('h1').first()).toContainText(
      'Welcome to the Ansible Automation Platform'
    );

    await page.getByRole('button', { name: controllerKeyCloakUser?.username || 'mock' }).click();
    await page.getByRole('menuitem', { name: 'User details' }).click();
    await page.getByLabel('kebab dropdown toggle').click();
    await page.getByRole('menuitem', { name: 'Link user accounts' }).click();
    await page
      .getByLabel('Link your Automation Hub account')
      .getByLabel('Username')
      .fill(hubUser?.username || 'hub_user');
    await page.getByLabel('Password').fill(hubUser?.password || 'hub_pw');
    await page.getByRole('button', { name: 'Link', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Linked', exact: true }).first()).toBeVisible();
  }
);

// Since the assertions in the following tests occur within the Keycloak UI, they are not applicable for testing against the mock API
test.describe('Negative paths for controller Keycloak authentication', () => {
  test(
    'awx keycloak - fails to authenticate with incorrect password',
    { tag: ['@upgrade', '@not_e2e', '@not_mock'] },
    async ({ page }) => {
      const erroneousPassword = 'E2Epass ' + randomString(4);

      await page.goto(platformUI);
      await page.getByRole('link', { name: 'I have an Automation Controller account' }).click();
      await page.getByRole('link', { name: 'Keycloak' }).click();

      if (!page.mock.enabled) {
        // use the real keycloak and controller login pages
        await page.getByLabel('Username or email').fill(controllerKeyCloakUser?.username);
        await page.getByLabel('Password', { exact: true }).fill(erroneousPassword);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('Invalid username or password.')).toBeVisible();
      }
    }
  );
  test(
    'awx keycloak - fails to authenticate with a user that does not exist',
    { tag: ['@upgrade', '@not_e2e'] },
    async ({ page }) => {
      const nonExistentUsername = 'E2Euser ' + randomString(4);
      const erroneousPassword = 'E2Epass ' + randomString(4);

      await page.goto(platformUI);
      await page.getByRole('link', { name: 'I have an Automation Controller account' }).click();
      await page.getByRole('link', { name: 'Keycloak' }).click();

      if (!page.mock.enabled) {
        // use the real keycloak and controller login pages
        await page.getByLabel('Username or email').fill(nonExistentUsername);
        await page.getByLabel('Password', { exact: true }).fill(erroneousPassword);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page.getByText('Invalid username or password.')).toBeVisible();
      }
    }
  );
});
