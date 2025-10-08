import { expect, test } from '@playwright/test';
import { checkBuildType } from '../../../../commands/checkBuildType';
import { SAAS_URL } from '../../../../commands/constants';
import { createE2EName } from '../../../../commands/createE2EName';
import { navigateTo } from '../../../../commands/navigateTo';
import { setupAfter, setupBefore } from '../../../../commands/setup';
import { createEdaCredentialType } from '../credential-types/credential-types-utils';
import { createEdaCredential, deleteEdaCredential } from './credentials-utils';

test.beforeEach(setupBefore({ path: '/decisions/infrastructure/credentials' }));
test.afterEach(setupAfter);

// Skip all tests if running on SaaS deployment
test.beforeAll(async ({ request }) => {
  const buildType = await checkBuildType(request);
  if (buildType === SAAS_URL) {
    test.skip();
  }
});

test(
  'eda credentials - can create a credential and assert info on the details page',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    const credentialOne = await createEdaCredential({}, page);
    await expect(page.locator('#name')).toContainText(credentialOne);
    await expect(page.getByText('Red Hat Ansible Automation')).toBeVisible();
    await deleteEdaCredential(credentialOne, page);
  }
);

test(
  'eda credentials - create a credential of type Basic Anlytics and get the right error message on duplication',
  { tag: ['@not_mock'] },
  async ({ page }) => {
    test.setTimeout(150000);
    const credentialName = createE2EName('credential');
    await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Basic Analytics');
    await page.getByRole('button', { name: 'apply filter' }).click();
    await page.waitForTimeout(2000);
    if (await page.getByRole('heading', { name: 'No results found' }).isVisible()) {
      await page.getByRole('button', { name: 'Clear all filters' }).nth(1).click();
      await createEdaCredentialType(
        {
          credentialTypeName: 'Basic Analytics',
          inputType: JSON.stringify({
            fields: [
              {
                id: 'auth_type',
                type: 'string',
                label: 'Analytics Authentication Type',
                hidden: true,
                default: 'basic',
              },
              {
                id: 'username',
                type: 'string',
                label: 'Username',
                help_text: 'The username of REDHAT or SUBSCRIPTIONS',
              },
              {
                id: 'password',
                type: 'string',
                label: 'Password',
                secret: true,
                help_text: 'The password of REDHAT or SUBSCRIPTIONS',
              },
              {
                id: 'gather_interval',
                type: 'string',
                label: 'Analytics Gather Interval',
                default: '14400',
                help_text: 'The time interval between each collection (secs)',
              },
              {
                id: 'insights_tracking_state',
                type: 'boolean',
                label: 'Insights Tracking State',
                default: false,
                help_text:
                  'Enables the service to gather data on automation and send it to Automation Analytics',
              },
            ],
            required: ['auth_type', 'username', 'password'],
          }),
        },
        page
      );
      await expect(page.locator('#name')).toContainText('Basic Analytics');
    }
    //remove existing credentials, if any
    await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Basic Analytics');
    await page.getByRole('button', { name: 'apply filter' }).click();
    await page.getByRole('link', { name: 'Basic Analytics' }).click();
    await page.getByRole('tab', { name: 'Credentials' }).click();
    await page.waitForTimeout(2000);
    if (await page.getByRole('heading', { name: 'There are currently no' }).isVisible()) {
      await page.getByRole('link', { name: 'Create credential' }).click();
    } else {
      await page.getByRole('checkbox', { name: 'Select all' }).check();
      await page.getByRole('button', { name: 'toolbar actions' }).click();
      await page.getByRole('menuitem', { name: 'Delete credentials' }).click();
      await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
      await page.getByRole('button', { name: 'Delete credentials' }).click();

      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await page.getByRole('button', { name: 'Create credential' }).click();
    }
    await page.getByRole('textbox', { name: 'Name' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(credentialName);
    await page.getByRole('button', { name: 'Organization' }).click();
    await page.getByRole('option', { name: 'Default The default' }).click();
    await page.getByRole('button', { name: 'Credential type' }).click();
    await page.getByRole('textbox', { name: 'Search input' }).fill('Basic Analytics');
    await page.getByRole('option', { name: 'Basic Analytics' }).click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('test');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('test');
    await page.getByRole('button', { name: 'Create credential' }).click();
    await expect(page.locator('#name')).toContainText(credentialName);
    await page.getByRole('button', { name: 'Duplicate credential' }).click();
    await expect(page.getByText('Only one credential is allowed for type')).toBeVisible();
    await deleteEdaCredential(credentialName, page);
  }
);
