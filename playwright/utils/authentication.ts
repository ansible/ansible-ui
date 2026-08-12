import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { fillMonacoEditor } from '../commands/fillMonacoEditor';
import { navigateTo } from '../commands/navigateTo';

export interface CreateAuthenticationMethodOptions {
  name?: string;
  type?: string;
}

export interface CreateAuthenticationMapOptions {
  authenticatorName: string;
  name?: string;
  trigger?: string;
}

export const Authentication = {
  ui: {
    createMethod: async (
      page: Page,
      options: CreateAuthenticationMethodOptions = {}
    ): Promise<string> => {
      const authMethodName = createE2EName(options.name ?? 'authentication-method');
      const authType = options.type ?? 'Local';
      await navigateTo(page, 'Access Management', 'Authentication Methods');

      await page.getByRole('link', { name: 'Create authentication' }).click();
      await page.getByRole('textbox', { name: 'Name' }).fill(authMethodName);
      await page.getByRole('button', { name: 'Local' }).click();
      await page.getByRole('option', { name: authType, exact: true }).click();
      switch (authType) {
        case 'Azure AD': {
          const clientIdField = page.getByTestId('configuration-input-KEY');
          await clientIdField.fill('1234abc');
          const secretField = page.getByTestId('configuration-input-SECRET');
          await secretField.fill('Azure Secret');
          break;
        }
        case 'GitHub':
          await page.getByRole('textbox', { name: 'GitHub OAuth2 Key' }).fill('GithubKey');
          await page.getByRole('textbox', { name: 'GitHub OAuth2 Secret' }).fill('GithubSecret');
          break;
        case 'Google OAuth':
          await page.getByRole('textbox', { name: 'Google OAuth2 Key' }).fill('GoogleKey');
          await page.getByRole('textbox', { name: 'Google OAuth2 Secret' }).fill('GoogleSecret');
          break;
        case 'LDAP':
          await page
            .getByRole('textbox', { name: 'LDAP Server URI' })
            .fill('ldap://ldap.example.com:389');
          await page.getByRole('button', { name: 'Select a value' }).click();
          await page.getByRole('option', { name: 'MemberDNGroupType', exact: true }).click();
          await fillMonacoEditor(
            page,
            `{name_attr: "cn", member_attr: "member"}`,
            page.locator('#configuration-editor-GROUP_TYPE_PARAMS').getByRole('textbox')
          );
          await fillMonacoEditor(
            page,
            'email: "mail"',
            page.locator('#configuration-editor-USER_ATTR_MAP').getByRole('textbox')
          );
          break;
        case 'TACACS+':
          await page
            .getByRole('textbox', { name: 'Hostname of TACACS+ Server' })
            .fill('tacacs.example.com');
          await page
            .getByRole('textbox', { name: 'Shared secret for authenticating to TACACS+ server.' })
            .fill('TACACSSecret');
          break;
        case 'Local':
        default:
          break;
      }
      await page.getByRole('button', { name: 'Create Authentication Method' }).click();
      await expect(page.getByRole('heading')).toContainText(authMethodName);
      await expect(page.locator('#name')).toContainText(authMethodName);
      await expect(page.locator('#type')).toContainText(authType);

      return authMethodName;
    },

    deleteMethod: async (page: Page, authenticatorName: string): Promise<void> => {
      await navigateTo(page, 'Access Management', 'Authentication Methods');
      await clickTableRow({ filterLabel: 'Name', text: authenticatorName }, page);
      await clickPageAction('Delete authentication', page);
      await confirmAndAssertDeletion(page);
    },

    createMap: async (page: Page, options: CreateAuthenticationMapOptions): Promise<string> => {
      const mapName = createE2EName(options.name ?? 'authentication-mapping');

      await navigateTo(page, 'Access Management', 'Authentication Methods');
      await clickTableRow({ filterLabel: 'Name', text: options.authenticatorName }, page);
      await page.getByRole('tab', { name: 'Mapping' }).click();

      await page.getByRole('link', { name: 'Create mapping' }).click();
      await page.getByRole('textbox', { name: 'name' }).fill(mapName);
      await page.getByRole('button', { name: 'Select rule condition' }).click();
      await page.getByRole('option', { name: options.trigger ?? 'Always' }).click();
      if (options.trigger === 'Attributes') {
        await page.getByRole('button', { name: 'Based on attributes' }).click();
        await page.getByRole('button', { name: 'Select condition type' }).click();
        await page.getByRole('option', { name: 'at least one' }).click();
        await page.getByRole('textbox', { name: 'Attribute' }).click();
        await page.getByRole('textbox', { name: 'Attribute' }).fill('Attribute one');
        await page.getByRole('button', { name: 'Comparison' }).click();
        await page.getByRole('option', { name: 'equals' }).click();
        await page.getByRole('textbox', { name: 'Value' }).click();
        await page.getByRole('textbox', { name: 'Value' }).fill('value one');
        await page.getByRole('button', { name: 'Add attribute' }).click();
        await page.locator('#attributes-1-attribute').click();
        await page.locator('#attributes-1-attribute').fill('Attribute two');
        await page.locator('#attributes-1-comparison').click();
        await page.getByRole('option', { name: 'matches' }).click();
        await page.locator('#attributes-1-value').click();
        await page.locator('#attributes-1-value').fill('value two');
      }

      await page.getByRole('button', { name: 'Create mapping' }).click();

      await expect(page.getByRole('heading', { name: mapName })).toBeVisible();
      await page.getByRole('link', { name: 'Mapping' }).click();
      return mapName;
    },
  },
} as const;
