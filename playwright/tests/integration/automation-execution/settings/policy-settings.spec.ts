import { expect, test } from '@playwright/test';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { interceptRequest } from '@ansible/playwright/tests/util/interceptRequest';

type PolicySettings = Record<string, string | number | boolean>;

test.beforeEach(setupBefore({ path: '/overview' }));
test.afterEach(setupAfter);
test.setTimeout(2 * 60 * 1000);
test.describe('Policy setting details', () => {
  test('should display details', { tag: [] }, async ({ page }) => {
    await navigateTo(page, 'Settings', 'Automation Execution', 'Policy');

    const settingsRequest = interceptRequest(page, '*/**/settings/policyascode/');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Policy');
    const settings = (await settingsRequest) as PolicySettings;
    if (settings.OPA_HOST) {
      await expect(page.locator('#opa-server-hostname')).toContainText(settings.OPA_HOST as string);
    }
    await expect(page.locator('#opa-server-port')).toContainText(
      (settings.OPA_PORT as number).toString()
    );
    await expect(page.locator('#use-ssl-for-opa-connection')).toContainText(
      settings.OPA_SSL ? 'Enabled' : 'Disabled'
    );
    await expect(page.locator('#opa-request-timeout')).toContainText(
      (settings.OPA_REQUEST_TIMEOUT as number).toString()
    );
    await expect(page.locator('#opa-request-retry-count')).toContainText(
      (settings.OPA_REQUEST_RETRIES as number).toString()
    );
  });
});

test.describe('Policy settings form', () => {
  test('should render correct information', { tag: [] }, async ({ page }) => {
    const settingsRequest = interceptRequest(page, '*/**/settings/policyascode/');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Policy');
    const settings = (await settingsRequest) as PolicySettings;
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Policy Settings' })).toBeVisible();
    if (settings.OPA_HOST) {
      await expect(page.getByRole('textbox', { name: 'OPA Server Hostname' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'OPA Server Hostname' })).toHaveValue(
        settings.OPA_HOST as string
      );
    }
    await expect(page.locator('#opa-request-timeout')).toBeVisible();
    if (settings.OPA_REQUEST_TIMEOUT !== undefined) {
      await expect(page.locator('#opa-request-timeout')).toHaveValue(
        (settings.OPA_REQUEST_TIMEOUT as number).toString()
      );
    }
    if (settings.OPA_REQUEST_RETRIES !== undefined) {
      await expect(page.getByRole('spinbutton', { name: 'OPA Request Retry Count' })).toHaveValue(
        (settings.OPA_REQUEST_RETRIES as number).toString()
      );
    }
  });

  test('should save edited values when submitted', { tag: [] }, async ({ page }) => {
    const settingsRequest = interceptRequest(page, '*/**/settings/policyascode/');
    await navigateTo(page, 'Settings', 'Automation Execution', 'Policy');
    const settings = (await settingsRequest) as PolicySettings;
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Policy Settings' })).toBeVisible();

    if (settings.OPA_HOST) {
      await expect(page.getByRole('textbox', { name: 'OPA Server Hostname' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'OPA Server Hostname' })).toHaveValue(
        settings.OPA_HOST as string
      );
    }
    await expect(page.locator('#opa-request-timeout')).toBeVisible();
    if (settings.OPA_REQUEST_TIMEOUT !== undefined) {
      await expect(page.locator('#opa-request-timeout')).toHaveValue(
        (settings.OPA_REQUEST_TIMEOUT as number).toString()
      );
    }
    if (settings.OPA_REQUEST_RETRIES !== undefined) {
      await expect(page.getByRole('spinbutton', { name: 'OPA Request Retry Count' })).toHaveValue(
        (settings.OPA_REQUEST_RETRIES as number).toString()
      );
    }
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
    await expect(page.locator('#opa-authentication-token')).toContainText('$encrypted$');
  });
});
