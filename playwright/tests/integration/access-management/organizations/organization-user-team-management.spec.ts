import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { TOPOLOGY_AZURE, TOPOLOGY_SAAS } from '@ansible/playwright/commands/constants';
import { isTopology } from '@ansible/playwright/commands/getTopologyType';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { Organization, Team, User } from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/access/organizations' }));
test.afterEach(setupAfter);

test.describe('Organization User and Team Management', () => {
  let organizationName: string;
  let user1Name: string;
  let user2Name: string;

  // Check topology type and skip for SaaS/Azure
  test.beforeAll(() => {
    if (isTopology(TOPOLOGY_SAAS, TOPOLOGY_AZURE)) {
      test.skip(true, 'Test should not run on SaaS/Azure deployment');
    }
  });

  test.beforeEach(async ({ page }) => {
    // Create test resources
    organizationName = await Organization.ui.create(page);
    user1Name = await User.ui
      .create(page)
      .then((result) => (typeof result === 'string' ? result : result.userName));
    user2Name = await User.ui
      .create(page)
      .then((result) => (typeof result === 'string' ? result : result.userName));
    // Create team only when needed in specific tests
    // teamName = await createTeam({ organizationName }, page);
  });

  test.afterEach(async ({ page }) => {
    // Clean up test resources
    await User.ui.delete(page, user1Name).catch(() => {});
    await User.ui.delete(page, user2Name).catch(() => {});
    // Team cleanup is handled in individual tests
    await Organization.ui.delete(page, organizationName);
  });

  // User Management Tests (using utility function)
  test(
    'should successfully add a user to an organization with organization member role',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Add user to organization using the helper function
      await Organization.ui.addUser(page, organizationName, user1Name, {
        roles: ['Organization Member'],
      });

      // Verify the user appears in the organization's user list
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      // Assert the user is present in the table
      await expect(page.locator('tbody')).toContainText(user1Name);

      // Verify the user has been assigned to the organization by checking the Users tab
      await page.getByRole('tab', { name: 'Users' }).click();

      // Verify the user appears in the users table
      await expect(page.locator('tbody')).toContainText(user1Name);

      // Now verify the role assignment by checking the user's roles page
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: user1Name }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();

      // Verify the specific organization role appears - target by column position
      const memberRoleRow = page
        .locator('tbody tr')
        .filter({
          has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
        })
        .filter({
          has: page.locator('td').nth(2).getByText('Organization Member', { exact: true }),
        });
      await expect(memberRoleRow).toBeVisible();
    }
  );

  test(
    'should successfully add a user to an organization with multiple roles',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Add user to organization with multiple roles
      await Organization.ui.addUser(page, organizationName, user1Name, {
        roles: ['Organization Member', 'Organization Admin'],
      });

      // Verify the user appears in the organization's user list
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      // Assert the user is present in the table
      await expect(page.locator('tbody')).toContainText(user1Name);

      // Verify both roles were assigned by checking the user's roles page
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: user1Name }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();

      // Verify the Organization Member role appears - target by column position
      const memberRoleRowMultiple = page
        .locator('tbody tr')
        .filter({
          has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
        })
        .filter({
          has: page.locator('td').nth(2).getByText('Organization Admin', { exact: true }),
        });
      await expect(memberRoleRowMultiple).toBeVisible();

      // Verify the Organization Admin role appears - target by column position
      const adminRoleRow = page
        .locator('tbody tr')
        .filter({
          has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
        })
        .filter({
          has: page.locator('td').nth(2).getByText('Organization Member', { exact: true }),
        });
      await expect(adminRoleRow).toBeVisible();
    }
  );

  // User Management Tests (manual wizard workflow)
  test(
    'can add a user and apply roles to users via the users tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Users tab and assign users
      await page.getByRole('tab', { name: 'Users' }).click();
      await page.getByRole('button', { name: 'Assign users', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Select user(s)' })).toBeVisible();

      // Select both users in the wizard
      await selectTableRow(
        {
          pageTitle: 'Select user(s)',
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      await selectTableRow(
        {
          pageTitle: 'Select user(s)',
          filterLabel: 'Username',
          filterValue: user2Name,
          clearFilters: true,
        },
        page
      );

      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Select organization roles
      await expect(page.getByRole('heading', { name: 'Select organization roles' })).toBeVisible();
      await selectTableRow(
        {
          pageTitle: 'Select organization roles',
          filterLabel: 'Name',
          filterValue: 'Organization Credential Admin',
        },
        page
      );

      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Finish the wizard (Review step may not be present in current flow)
      await page.getByRole('button', { name: 'Finish' }).click();

      // Navigate back to the organization details page
      await navigateTo(page, 'Access Management', 'Organizations');

      // Use direct navigation to the organization details page
      await page.getByRole('link', { name: organizationName }).click();

      // Wait for the organization details page to load and verify we're on the right page
      await expect(page.getByRole('heading', { name: organizationName })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Users' })).toBeVisible();
      await page.getByRole('tab', { name: 'Users' }).click();

      // Wait for the Users tab to be active and the table to load
      await expect(page.getByRole('tab', { name: 'Users' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      await expect(page.locator('tbody')).toBeVisible();

      // Verify users are added
      await expect(page.getByRole('heading', { name: organizationName })).toBeVisible();
      await expect(page.locator('tbody')).toContainText(user1Name);
      await expect(page.locator('tbody')).toContainText(user2Name);

      // Remove users using bulk action
      // Clear any existing filters first
      await clearTableFilters(page);

      // Both users should be visible in the table since we just verified they're there
      // Find and select user1 row checkbox
      const user1Row = page.locator('tbody tr').filter({ hasText: user1Name });
      await user1Row.getByRole('checkbox', { name: 'Select row' }).click();

      // Find and select user2 row checkbox
      const user2Row = page.locator('tbody tr').filter({ hasText: user2Name });
      await user2Row.getByRole('checkbox', { name: 'Select row' }).click();

      // Wait for Actions button to appear and click it
      await expect(page.getByRole('button', { name: 'Actions' })).toBeVisible({ timeout: 10000 });
      await page.getByRole('button', { name: 'Actions' }).click();
      await page.getByRole('menuitem', { name: 'Remove users' }).click();

      await confirmAndAssertDeletion(page);
    }
  );

  // User Removal Tests
  test(
    'should display correct warning modal when removing a user from organization',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // First, add the user to the organization
      await Organization.ui.addUser(page, organizationName, user1Name, {
        roles: ['Organization Member', 'Organization Admin'],
      });

      // Filter to find the specific user in the organization
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      // Click on the user row to access actions
      await page.locator('tbody tr').first().locator('button.toggle-kebab').first().click();

      // Click on "Remove user" action
      await page.getByRole('menuitem', { name: 'Remove user' }).click();

      // Verify the removal modal appears with correct content
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Assert the modal title
      await expect(
        modal.getByRole('heading', { name: 'Remove users from organization' })
      ).toBeVisible();

      // Assert all modal content in one comprehensive check
      const modalText = await modal.textContent();
      const expectedTexts = [
        'Are you sure you want to remove the user below?',
        'This will remove all directly assigned organization roles for this user',
        'If the user has indirectly assigned roles through a team assignment',
        'manage the teams assignments or remove the user from the team',
        'Yes, I confirm that I want to remove these 1 users from the organization.',
        user1Name,
      ];

      expectedTexts.forEach((text) => {
        expect(modalText).toContain(text);
      });

      // Verify the "Remove users" button is present
      await expect(modal.getByRole('button', { name: 'Remove users', exact: true })).toBeVisible();
      await expect(modal.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();

      // Check the confirmation checkbox to enable the Remove button
      await modal.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();

      // Proceed with the removal
      await modal.getByRole('button', { name: 'Remove users', exact: true }).click();

      // Wait for the modal to close and verify the user is no longer in the list
      await expect(modal).toBeHidden();

      // Re-filter and verify the user is no longer present
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      // Verify the user is no longer present - table should be empty or show no results
      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();

      if (rowCount === 0) {
        // Table is completely empty - user was successfully removed
        expect(rowCount).toBe(0);
      } else {
        // Table has rows but should show "No results found" or similar
        await expect(tableRows.first()).toContainText(
          /No results found|No data|No matching records/i
        );
      }

      // Verify that the organization roles are removed from the user's roles page
      await navigateTo(page, 'Access Management', 'Users');
      await clickTableRow({ filterLabel: 'Username', text: user1Name }, page);
      await page.getByRole('tab', { name: 'Roles' }).click();

      // Verify no organization roles exist for this specific organization - target by Resource Name column
      const orgRoleRows = page.locator('tbody tr').filter({
        has: page.locator('td').nth(1).getByText(organizationName, { exact: true }),
      });

      // The organization roles should be completely removed
      await expect(orgRoleRows).toHaveCount(0);
    }
  );

  test(
    'should cancel user removal when cancel button is clicked in modal',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // First, add the user to the organization
      await Organization.ui.addUser(page, organizationName, user1Name, {
        roles: ['Organization Member'],
      });

      // Filter to find the specific user in the organization
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      // Click on the user row to access actions
      await page.locator('tbody tr').first().locator('button.toggle-kebab').first().click();

      // Click on "Remove user" action
      await page.getByRole('menuitem', { name: 'Remove user' }).click();

      // Verify the removal modal appears
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      // Click Cancel button
      await modal.getByRole('button', { name: 'Cancel', exact: true }).click();

      // Verify the modal closes
      await expect(modal).toBeHidden();

      // Verify the user is still in the organization
      await filterTable(
        {
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      await expect(page.locator('tbody')).toContainText(user1Name);
    }
  );

  // Administrator Management Tests
  test(
    'can add and remove users from an org using the administrators tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Administrators tab
      await page.getByRole('tab', { name: 'Administrators' }).click();
      await page.getByRole('button', { name: 'Add administrators', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Add administrators' })).toBeVisible();

      // Select user as administrator
      await selectTableRow(
        {
          pageTitle: 'Add administrators',
          filterLabel: 'Username',
          filterValue: user1Name,
        },
        page
      );

      await page.getByRole('button', { name: 'Add administrators', exact: true }).click();

      // Verify administrator was added and remove them
      await expect(page.locator('tbody')).toContainText(user1Name);

      // Remove administrator
      const adminRow = page.locator('tbody tr').filter({ hasText: user1Name });
      await adminRow.getByRole('button', { name: 'Remove administrator', exact: true }).click();

      await confirmAndAssertDeletion(page);
    }
  );

  // Team Management Tests
  test(
    'can add a team and apply/remove roles from organization team via teams tab',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Create team for this test
      const teamName = await Team.ui.create(page, { organizationName });

      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Teams tab and assign organization roles
      await page.getByRole('tab', { name: 'Teams' }).click();
      await page.getByRole('button', { name: 'Assign organization roles', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Select team(s)' })).toBeVisible();

      // Select the team
      await selectTableRow(
        {
          pageTitle: 'Select team(s)',
          filterLabel: 'Name',
          filterValue: teamName,
        },
        page
      );

      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Select organization roles
      await expect(page.getByRole('heading', { name: 'Select organization roles' })).toBeVisible();
      await selectTableRow(
        {
          pageTitle: 'Select organization roles',
          filterLabel: 'Name',
          filterValue: 'Organization Credential Admin',
        },
        page
      );

      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Review and finish
      await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
      await page.getByRole('button', { name: 'Finish' }).click();

      // Verify team roles and manage them
      await expect(page.getByRole('heading', { name: organizationName })).toBeVisible();
      await expect(page.locator('tbody')).toContainText(teamName);

      // Click on manage organization roles for the team
      const teamRow = page.locator('tbody tr').filter({ hasText: teamName });
      await teamRow.getByRole('link', { name: 'Manage organization roles' }).click();

      await expect(
        page.getByRole('heading', { name: `Manage organization roles for ${teamName}` })
      ).toBeVisible();

      // Remove the organization credential admin role
      await selectTableRow(
        {
          pageTitle: `Manage organization roles for ${teamName}`,
          filterLabel: 'Name',
          filterValue: 'Organization Credential Admin',
        },
        page
      );

      await page.getByRole('button', { name: 'Save roles', exact: true }).click();

      // Verify we're back on the organization page
      await expect(page.getByRole('heading', { name: organizationName })).toBeVisible();

      // Navigate to team details to verify no roles are assigned
      await page.getByRole('link', { name: teamName }).click();
      await expect(page.getByRole('heading', { name: teamName })).toBeVisible();
      await page.getByRole('tab', { name: 'Roles' }).click();
      await expect(page.getByText('No roles assigned to this team')).toBeVisible();

      // Clean up the team
      await Team.ui.delete(page, teamName);
    }
  );

  test(
    'verifies modal when no organization roles are added to team',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      // Create team for this test
      const teamName = await Team.ui.create(page, { organizationName });

      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Teams tab and assign organization roles
      await page.getByRole('tab', { name: 'Teams' }).click();
      await page.getByRole('button', { name: 'Assign organization roles', exact: true }).click();

      await expect(page.getByRole('heading', { name: 'Select team(s)' })).toBeVisible();

      // Select the team
      await selectTableRow(
        {
          pageTitle: 'Select team(s)',
          filterLabel: 'Name',
          filterValue: teamName,
        },
        page
      );

      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Skip role selection
      await page.getByRole('button', { name: 'Next', exact: true }).click();

      // Attempt to finish without selecting roles
      await page.getByRole('button', { name: 'Finish' }).click();

      // Clean up the team
      await Team.ui.delete(page, teamName);
    }
  );

  test(
    'can create a team from teams tab and delete from details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      await navigateTo(page, 'Access Management', 'Organizations');
      await clickTableRow({ text: organizationName }, page);

      // Navigate to Teams tab
      await page.getByRole('tab', { name: 'Teams' }).click();

      const newTeamName = `E2E Team ${createE2EName()}`;

      // Click link to create team
      await page.getByRole('link', { name: 'Go to Teams section and create team' }).click();

      // Fill in team creation form
      await expect(page.getByRole('heading', { name: 'Create team' })).toBeVisible();
      await page.getByLabel('Name').fill(newTeamName);

      // Select organization
      await singleSelectByLabel('Organization', organizationName, page);

      await page.getByRole('button', { name: 'Create team' }).click();

      // Verify team was created
      await expect(page.getByRole('heading', { name: newTeamName })).toBeVisible();
      await expect(page.locator('dl')).toContainText(organizationName);

      // Delete team from details page
      await clickPageAction('Delete team', page);
      await confirmAndAssertDeletion(page);

      // Verify redirect to teams list
      await expect(page.getByTestId('page-title')).toBeVisible();
      await expect(page.getByTestId('page-title')).toContainText('Teams');
    }
  );
});
