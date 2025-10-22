import { Page, expect } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

export async function createEdaCredentialType(
  options: { credentialTypeName?: string; inputType?: string },
  page: Page
) {
  await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
  await page.getByText('Create credential type').click();
  const credentialTypeName = options.credentialTypeName ?? createE2EName('credential_type');
  await page.getByPlaceholder('Enter credential type name').fill(credentialTypeName);
  await page.locator('.view-lines').first().click();
  await page
    .locator('#inputs')
    .getByRole('textbox', { name: 'Editor content' })
    .fill(
      options?.inputType ??
        JSON.stringify({
          fields: [
            {
              id: 'auth_type',
              type: 'string',
              label: 'Event Stream Authentication Type',
              hidden: true,
              default: 'basic',
            },
            {
              id: 'username',
              type: 'string',
              label: 'Username',
              help_text: 'The username used to authenticate the incoming event stream',
            },
            {
              id: 'password',
              type: 'string',
              label: 'Password',
              secret: true,
              help_text: 'The password used to authenticate the incoming event stream',
            },
          ],
        })
    );
  await page.getByRole('button', { name: 'Create credential type' }).click();
  await expect(page.getByRole('heading', { name: credentialTypeName, exact: true })).toBeVisible();
  return credentialTypeName;
}

export async function deleteEdaCredentialType(credentialTypeName: string, page: Page) {
  await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credential Types');
  await clickTableRow(
    {
      text: credentialTypeName,
      pageTitle: 'Credential Types',
      filterLabel: 'Name',
      filterValue: credentialTypeName,
      clearFilters: true,
    },
    page
  );
  await clickPageAction('Delete credential type', page);
  await confirmAndAssertDeletion(page);
}
