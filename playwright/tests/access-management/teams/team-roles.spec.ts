import { expect, test } from '@playwright/test';
import { clickTableRow } from '../../../commands/clickTableRow';
import { setupAfter, setupBefore } from '../../../commands/setup';
import {
  createAwxCredential,
  deleteAwxCredential,
} from '../../automation-execution/infrastructure/credentials/credential-utils';
import { createUser, deleteUser } from '../users/user-utils';
import { createTeam, deleteTeam } from './team-utils';
test.beforeEach(setupBefore({ path: '/access/teams' }));
test.afterEach(setupAfter);

test(
  'team roles tab - assign a role to a team and then remove it',
  { tag: ['@team', '@not_mock'] },
  async ({ page }) => {
    const credentialName = await createAwxCredential({}, page);
    const teamName = await createTeam({}, page);

    await page.getByRole('tab', { name: 'Roles' }).click();
    await expect(page.getByRole('button', { name: 'Assign roles' })).toBeVisible();
    await page.getByRole('button', { name: 'Assign role' }).click();
    await page.getByLabel('Breadcrumb').getByText('Assign roles').click();
    await expect(page.getByRole('heading', { name: 'Assign roles' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Credential');
    await page.locator('[id="select-create-typeahead-awx.credential"]').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(credentialName);
    await page.getByRole('button', { name: 'apply filter' }).click();
    await page.getByRole('checkbox', { name: 'Select row' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Admin');
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Resources' })).toContainText(credentialName);
    await expect(page.getByRole('region', { name: 'Platform roles' })).toContainText(
      'Credential Admin'
    );
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.getByRole('heading', { name: teamName })).toBeVisible();
    await expect(page.getByRole('link', { name: credentialName }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Remove role' }).click();
    await expect(page.getByRole('heading', { name: 'Warning alert: Remove role' })).toBeVisible();
    await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
    await page.getByRole('button', { name: 'Remove role' }).click();
    await expect(
      page.getByRole('heading', { name: 'No roles assigned to this team' })
    ).toBeVisible();
    await deleteTeam(teamName, page);
    await deleteAwxCredential(credentialName, page);
  }
);

test(
  'team roles - verify user inherits team roles when added to team',
  {
    tag: ['@team', '@not_mock'],
  },
  async ({ page }) => {
    const userName = await createUser({}, page);
    const credentialName = await createAwxCredential({}, page);
    const teamName = await createTeam({}, page);

    //Assign role to team
    await page.getByRole('tab', { name: 'Roles' }).click();
    await expect(page.getByRole('button', { name: 'Assign roles' })).toBeVisible();
    await page.getByRole('button', { name: 'Assign role' }).click();
    await page.getByLabel('Breadcrumb').getByText('Assign roles').click();
    await expect(page.getByRole('heading', { name: 'Assign roles' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Credential');
    await page.locator('[id="select-create-typeahead-awx.credential"]').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(credentialName);
    await page.getByRole('button', { name: 'apply filter' }).click();
    await page.getByRole('checkbox', { name: 'Select row' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill('Admin');
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Resources' })).toContainText(credentialName);
    await expect(page.getByRole('region', { name: 'Platform roles' })).toContainText(
      'Credential Admin'
    );
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.getByRole('heading', { name: teamName })).toBeVisible();

    //Assign user to team
    await page.getByRole('tab', { name: 'Users' }).click();
    await expect(page.getByRole('button', { name: 'Assign users' })).toBeVisible();
    await page.getByRole('button', { name: 'Assign users' }).click();
    await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
    await page.getByRole('textbox', { name: 'Type to filter' }).click();
    await page.getByRole('textbox', { name: 'Type to filter' }).fill(userName);
    await page.getByRole('textbox', { name: 'Type to filter' }).press('Enter');
    await page.getByRole('checkbox', { name: 'Select all rows' }).check();
    await page.getByRole('button', { name: 'Assign users' }).click();

    await clickTableRow({ text: userName }, page);
    await page.getByRole('tab', { name: 'Roles' }).click();
    const row = page.locator('table tr', { hasText: teamName });

    // Verify the row contains the team name and inheritance description
    await expect(row).toContainText(teamName);
    await expect(row).toContainText('Team Member');

    await deleteTeam(teamName, page);
    await deleteAwxCredential(credentialName, page);
    await deleteUser(userName, page);
  }
);
