import { expect, test } from '@playwright/test';
// import { setupAfter, setupBefore } from '../../../commands/setup';
import { navigateTo } from '../../../commands/navigateTo';
import { mockFeatureFlags } from '../../util/featureFlags';
import { interceptRequest } from '../../util/interceptRequest';

// test.beforeEach(setupBefore({ path: '/overview' }));
// test.afterEach(setupAfter);

//This test is currently disabled until we have a build with OPA policy enabled
test.skip('Policy settings: should display details', { tag: [] }, async ({ page }) => {
  await mockFeatureFlags(page, {
    FEATURE_POLICY_AS_CODE_ENABLED: true,
  });
  await navigateTo(page, 'Settings', 'Policy');

  let settings: Record<string, string | number | boolean>;
  if (page.mock.enabled) {
    settings = (
      page.mock.data.api.controller.v2.settings as {
        policyascode: Record<string, string | number | boolean>;
      }
    ).policyascode;
    await navigateTo(page, 'Settings', 'Policy');
  } else {
    const settingsRequest = interceptRequest(page, '*/**/settings/policyascode/');
    await navigateTo(page, 'Settings', 'Policy');
    settings = (await settingsRequest) as Record<string, string | number | boolean>;
  }
  if (settings.OPA_HOST) {
    await expect(page.locator('#opa-server-hostname')).toContainText(settings.OPA_HOST as string);
  }
  await expect(page.locator('#opa-server-port')).toContainText(settings.OPA_PORT.toString());
  await expect(page.locator('#use-ssl-for-opa-connection')).toContainText(
    settings.OPA_SSL ? 'Enabled' : 'Disabled'
  );
  await expect(page.locator('#opa-request-timeout')).toContainText(
    settings.OPA_REQUEST_TIMEOUT.toString()
  );
  await expect(page.locator('#opa-request-retry-count')).toContainText(
    settings.OPA_REQUEST_RETRIES.toString()
  );
});

//This test is currently disabled until we have a build with OPA policy enabled
test.skip(
  'Policy settings edit form: Should render correct information',
  { tag: [] },
  async ({ page }) => {
    await mockFeatureFlags(page, {
      FEATURE_POLICY_AS_CODE_ENABLED: true,
    });
    let settings: Record<string, string | number | boolean>;
    if (page.mock.enabled) {
      settings = (
        page.mock.data.api.controller.v2.settings as {
          policyascode: Record<string, string | number | boolean>;
        }
      ).policyascode;
      await navigateTo(page, 'Settings', 'Policy');
    } else {
      const settingsRequest = interceptRequest(page, '*/**/settings/policyascode/');
      await navigateTo(page, 'Settings', 'Policy');
      settings = (await settingsRequest) as Record<string, string | number | boolean>;
    }
    await page.getByRole('button', { name: 'Edit' }).click();
    if (settings.OPA_HOST) {
      await expect(page.getByRole('textbox', { name: 'OPA Server Hostname' })).toHaveValue(
        settings.OPA_HOST.toString()
      );
    }
    await expect(page.locator('#opa-request-timeout')).toHaveValue(
      settings.OPA_REQUEST_TIMEOUT.toString()
    );
    await expect(page.getByRole('spinbutton', { name: 'OPA Request Retry Count' })).toHaveValue(
      settings.OPA_REQUEST_RETRIES.toString()
    );
  }
);

//This test is currently disabled until we have a build with OPA policy enabled
test.skip(
  'Policy settings edit form: Should save edited values when submitted',
  { tag: [] },
  async ({ page }) => {
    await mockFeatureFlags(page, {
      FEATURE_POLICY_AS_CODE_ENABLED: true,
    });
    let settings: Record<string, string | number | boolean>;
    if (page.mock.enabled) {
      settings = (
        page.mock.data.api.controller.v2.settings as {
          policyascode: Record<string, string | number | boolean>;
        }
      ).policyascode;
      await navigateTo(page, 'Settings', 'Policy');
    } else {
      const settingsRequest = interceptRequest(page, '*/**/settings/policyascode/');
      await navigateTo(page, 'Settings', 'Policy');
      settings = (await settingsRequest) as Record<string, string | number | boolean>;
    }
    await page.getByRole('button', { name: 'Edit' }).click();
    if (settings.OPA_HOST) {
      await expect(page.getByRole('textbox', { name: 'OPA Server Hostname' })).toHaveValue(
        settings.OPA_HOST.toString()
      );
    }
    await expect(page.locator('#opa-request-timeout')).toHaveValue(
      settings.OPA_REQUEST_TIMEOUT.toString()
    );
    await expect(page.getByRole('spinbutton', { name: 'OPA Request Retry Count' })).toHaveValue(
      settings.OPA_REQUEST_RETRIES.toString()
    );
    // edit values

    await page.locator('#opa-auth-type-form-group-toggle').click();
    await page.getByRole('option', { name: 'Token' }).click();
    await page.getByRole('spinbutton', { name: 'OPA Request Timeout' }).click();
    await page.getByRole('spinbutton', { name: 'OPA Request Timeout' }).fill('2.0');
    await page.getByRole('spinbutton', { name: 'OPA Request Retry Count' }).click();
    await page.getByRole('spinbutton', { name: 'OPA Request Retry Count' }).fill('3');
    await page.getByRole('textbox', { name: 'OPA authentication token' }).fill('abc123');

    await page.getByRole('button', { name: 'Save' }).click();
    // assert that values have been saved
    await expect(page.locator('#opa-request-timeout')).toContainText('2');
    await expect(page.locator('#opa-request-retry-count')).toContainText('3');
    if (page.mock.enabled) {
      await expect(page.locator('#opa-authentication-token')).toContainText('abc123');
    } else {
      await expect(page.locator('#opa-authentication-token')).toContainText('$encrypted$');
    }
  }
);
