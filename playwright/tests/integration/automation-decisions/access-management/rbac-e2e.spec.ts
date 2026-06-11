import { EdaCredential as EdaCredentialType } from '@ansible/eda-ui/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaOrganization as EdaOrganizationType } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject as EdaProjectType } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook as EdaRulebookType } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { getTableRow } from '@ansible/playwright/commands/getTableRow';
import { login, platformUI } from '@ansible/playwright/commands/login';
import { logout } from '@ansible/playwright/commands/logout';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  DecisionEnvironment,
  EdaCredential,
  EdaOrganization,
  EdaProject,
  EdaRulebook,
  Organization,
  RulebookActivation,
  Team,
  User,
} from '@ansible/playwright/utils';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/rulebook-activations' }));
test.afterEach(setupAfter);

test.describe('EDA - RBAC - User and Team Permissions', () => {
  // Shared resources created in beforeAll
  let platformOrganization: PlatformOrganization;
  let edaOrganization: EdaOrganizationType;
  let edaProject: EdaProjectType;
  let edaRulebook: EdaRulebookType;
  let edaCredential: EdaCredentialType;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRulebookActivation: EdaRulebookActivation;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    try {
      await test.step('Setup: Login and create shared resources', async () => {
        await login(page);

        // Create platform organization (which creates corresponding EDA org)
        platformOrganization = await Organization.api.create(page, {});

        // Get the corresponding EDA organization
        const ansibleId = platformOrganization.summary_fields?.resource?.ansible_id;
        if (!ansibleId) {
          throw new Error('Platform organization missing ansible_id');
        }
        edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);

        // Create EDA project
        edaProject = await EdaProject.api.create(page, {
          organization: edaOrganization.id,
        });

        // Wait for project sync to complete
        await test.step('Wait for project sync', async () => {
          edaProject = await EdaProject.api.waitForSync(page, edaProject.id);
        });

        // Get hello_echo.yml rulebook from the project (or use first one if not found)
        edaRulebook = await EdaRulebook.api.getByProjectAndName(
          page,
          edaProject.id,
          'hello_echo.yml'
        );

        // Create EDA credential (dynamically resolve credential type ID)
        edaCredential = await EdaCredential.api.create(page, {
          name: `E2E Credential ${Date.now()}`,
          organizationName: edaOrganization.name,
          credentialTypeName: 'Container Registry',
          description: 'This is a container registry credential',
          inputs: {
            username: 'username',
            password: 'password',
          },
        });

        // Create decision environment
        edaDecisionEnvironment = await DecisionEnvironment.api.create(page, {
          name: `E2E Decision Environment ${Date.now()}`,
          organizationId: edaOrganization.id,
          imageUrl: 'quay.io/abakshirht/galaxy-ng-locust:ansible2.13',
          credentialId: edaCredential.id,
        });

        // Create rulebook activation (enabled so test can disable it)
        edaRulebookActivation = await RulebookActivation.api.create(page, {
          name: `E2E Rulebook Activation ${Date.now()}`,
          organizationId: edaOrganization.id,
          rulebookId: edaRulebook.id,
          decisionEnvironmentId: edaDecisionEnvironment.id,
          isEnabled: true,
          restartPolicy: 'on-failure',
          logLevel: 'error',
        });
      });
    } finally {
      await page.close();
    }
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();

    try {
      await login(page);

      // Cleanup in reverse order of creation
      if (edaRulebookActivation?.id) {
        await RulebookActivation.api.delete(page, edaRulebookActivation.id).catch(() => {});
      }
      if (edaDecisionEnvironment?.id) {
        await DecisionEnvironment.api.delete(page, edaDecisionEnvironment.id).catch(() => {});
      }
      if (edaCredential?.id) {
        await EdaCredential.api.delete(page, edaCredential.id).catch(() => {});
      }
      if (edaProject?.id) {
        await EdaProject.api.delete(page, edaProject.id).catch(() => {});
      }
      if (platformOrganization?.id) {
        await Organization.api.delete(page, platformOrganization.id).catch(() => {});
      }
    } finally {
      await page.close();
    }
  });

  test.describe('Users - Permissions', () => {
    let edaUser1: PlatformUser;
    let edaUser2: PlatformUser;

    test.beforeEach(async ({ page }) => {
      await test.step('Create test users', async () => {
        edaUser1 = await User.api.create(page, { password: 'pass' });
        edaUser2 = await User.api.create(page, { password: 'pass' });
      });
    });

    test.afterEach(async ({ page }) => {
      await test.step('Cleanup test users', async () => {
        if (edaUser1?.id) {
          await User.api.delete(page, edaUser1.id).catch(() => {});
        }
        if (edaUser2?.id) {
          await User.api.delete(page, edaUser2.id).catch(() => {});
        }
      });
    });

    test(
      'can give new user resource permission, verify role assignment, and verify new user ability to perform action',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to RBA details and click User Access tab', async () => {
          await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
          await expect(page.getByRole('heading', { name: 'Rulebook Activations' })).toBeVisible();

          await page
            .getByRole('textbox', { name: 'Type to filter' })
            .fill(edaRulebookActivation.name);
          await page.getByRole('button', { name: 'apply filter' }).click();

          const rbaLink = page.getByRole('link', { name: edaRulebookActivation.name });
          await Promise.all([
            page.waitForURL(`**/rulebook-activations/${edaRulebookActivation.id}/**`),
            rbaLink.click(),
          ]);

          await expect(
            page.getByRole('heading', { name: edaRulebookActivation.name, exact: true })
          ).toBeVisible();

          await page.getByRole('tab', { name: 'User Access', exact: true }).click();
        });

        await test.step('Assign Activation Admin role to user via wizard', async () => {
          await page.getByTestId('assign-users').click();

          // Step 1: Select user
          const userRow = await getTableRow(page, edaUser1.username);
          await userRow.getByRole('checkbox').click();

          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 2: Select Activation Admin role
          const roleRow = await getTableRow(page, 'Activation Admin');
          await roleRow.getByRole('checkbox').click();

          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 3: Finish
          await page.getByRole('button', { name: 'Finish', exact: true }).click();

          // Verify modal closes and user appears in list
          await expect(page.locator('dialog')).not.toBeVisible();
          await expect(page.getByText(edaUser1.username)).toBeVisible();
        });

        await test.step('Logout admin and login as user1', async () => {
          await logout(page, { username: process.env.PLATFORM_USERNAME });
          await login(page, undefined, {
            username: edaUser1.username,
            password: 'pass',
          });

          await expect(
            page
              .getByTestId('toolbar')
              .getByRole('button', { name: edaUser1.username, exact: true })
          ).toBeVisible();
        });

        await test.step('Navigate to RBA and toggle to disable', async () => {
          await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');

          // Filter to find the specific activation
          await page
            .getByRole('textbox', { name: 'Type to filter' })
            .fill(edaRulebookActivation.name);
          await page.getByRole('button', { name: 'apply filter' }).click();

          const rbaRow = await getTableRow(page, edaRulebookActivation.name);
          await rbaRow.getByTestId('toggle-switch').click();

          // Wait for confirmation dialog
          const dialog = page.getByRole('dialog');
          await expect(dialog).toBeVisible();

          // Confirm the action
          await dialog.getByRole('checkbox').first().check();
          await dialog.getByRole('button', { name: /disable|confirm/i }).click();

          // Verify success
          await expect(dialog).toContainText('Success');
        });

        await test.step('Logout user1 and login back as admin', async () => {
          await logout(page, { username: edaUser1.username });
          await login(page);
        });
      }
    );

    test(
      'other user cannot perform a specific action',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Logout admin and login as user2 (no permissions)', async () => {
          await logout(page, { username: process.env.PLATFORM_USERNAME });
          await login(page, undefined, {
            username: edaUser2.username,
            password: 'pass',
          });

          await expect(
            page
              .getByTestId('toolbar')
              .getByRole('button', { name: edaUser2.username, exact: true })
          ).toBeVisible();
        });

        await test.step('Verify user2 cannot access RBAs', async () => {
          await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');

          // Verify "no permission" message
          await expect(
            page.getByText('You do not have permission to create a rulebook activation.')
          ).toBeVisible();

          // Verify table does not exist
          await expect(page.locator('table.page-table')).not.toBeAttached();
        });

        await test.step('Logout user2 and login back as admin', async () => {
          await logout(page, { username: edaUser2.username });
          await login(page);
        });
      }
    );
  });

  test.describe('Teams - Permissions', () => {
    let edaUser1: PlatformUser;
    let edaUser2: PlatformUser;
    let edaTeam: PlatformTeam;
    let platformOrg: PlatformOrganization;

    test.beforeEach(async ({ page }) => {
      await test.step('Create platform org, team, and users', async () => {
        // Create platform organization for the team
        platformOrg = await Organization.api.create(page, {});

        // Create user1
        edaUser1 = await User.api.create(page, { password: 'pass' });

        // Create team in the platform organization
        edaTeam = await Team.api.create(page, {
          organization: platformOrg.id,
        });

        // Associate user1 with the team
        await Team.api.associateUsers(page, edaTeam.id, [edaUser1.id]);

        // Create user2 (not in team)
        edaUser2 = await User.api.create(page, { password: 'pass' });
      });
    });

    test.afterEach(async ({ page }) => {
      await test.step('Cleanup team, users, and org', async () => {
        if (edaUser1?.id) {
          await User.api.delete(page, edaUser1.id).catch(() => {});
        }
        if (edaUser2?.id) {
          await User.api.delete(page, edaUser2.id).catch(() => {});
        }
        if (edaTeam?.id) {
          await Team.api.delete(page, edaTeam.id).catch(() => {});
        }
        if (platformOrg?.id) {
          await Organization.api.delete(page, platformOrg.id).catch(() => {});
        }
      });
    });

    test(
      'can give new team resource permission, verify team assignment, and verify new team permission',
      { tag: ['@not_mock'] },
      async ({ page }) => {
        await test.step('Navigate to Project details and click Team Access tab', async () => {
          await navigateTo(page, 'Automation Decisions', 'Projects');
          await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();

          // Filter for the project
          await page.getByRole('textbox', { name: 'Type to filter' }).fill(edaProject.name);
          await page.getByRole('button', { name: 'apply filter' }).click();

          const projectLink = page.getByRole('link', { name: edaProject.name });
          await Promise.all([
            page.waitForURL(`**/projects/${edaProject.id}/**`),
            projectLink.click(),
          ]);

          await expect(
            page.getByRole('heading', { name: edaProject.name, exact: true })
          ).toBeVisible();

          await page.getByRole('tab', { name: 'Team Access', exact: true }).click();
        });

        await test.step('Assign Project Admin role to team via wizard', async () => {
          await page.getByRole('link', { name: 'Assign teams' }).click();

          // Step 1: Select team
          const teamRow = await getTableRow(page, edaTeam.name);
          await teamRow.getByRole('checkbox').click();

          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 2: Select Project Admin role
          const roleRow = await getTableRow(page, 'Project Admin');
          await roleRow.getByRole('checkbox').click();

          await page.getByRole('button', { name: 'Next', exact: true }).click();

          // Step 3: Finish
          await page.getByRole('button', { name: 'Finish', exact: true }).click();

          // Verify wizard closes and team appears in the Team Access list
          await expect(page.locator('dialog')).not.toBeVisible();
          await expect(page.getByText(edaTeam.name)).toBeVisible();
        });

        await test.step('Logout admin and login as user1 (team member)', async () => {
          await logout(page, { username: process.env.PLATFORM_USERNAME });
          await login(page, undefined, {
            username: edaUser1.username,
            password: 'pass',
          });

          await expect(
            page
              .getByTestId('toolbar')
              .getByRole('button', { name: edaUser1.username, exact: true })
          ).toBeVisible();
        });

        await test.step('Verify user1 can access project via team permission', async () => {
          await navigateTo(page, 'Automation Decisions', 'Projects');
          await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();

          // Filter for the project
          await page.getByRole('textbox', { name: 'Type to filter' }).fill(edaProject.name);
          await page.getByRole('button', { name: 'apply filter' }).click();

          const projectLink = page.getByRole('link', { name: edaProject.name });
          await Promise.all([
            page.waitForURL(`**/projects/${edaProject.id}/**`),
            projectLink.click(),
          ]);

          // Verify can see project name
          await expect(page.getByTestId('name')).toContainText(edaProject.name);

          // Navigate to Team Access tab
          await page.goto(`${platformUI}/decisions/projects/${edaProject.id}/team-access`);

          // Filter for the team (filter applies automatically)
          await page.getByRole('textbox', { name: 'Type to filter' }).fill(edaTeam.name);

          // Verify team appears with Project Admin role
          await expect(page.getByText(edaTeam.name)).toBeVisible();
          await expect(page.getByText('Project Admin')).toBeVisible();
        });

        await test.step('Logout user1 and login back as admin', async () => {
          await logout(page, { username: edaUser1.username });
          await login(page);
        });
      }
    );

    test('other user cannot perform that action', { tag: ['@not_mock'] }, async ({ page }) => {
      await test.step('Logout admin and login as user2 (not in team)', async () => {
        await logout(page, { username: process.env.PLATFORM_USERNAME });
        await login(page, undefined, {
          username: edaUser2.username,
          password: 'pass',
        });

        await expect(
          page.getByTestId('toolbar').getByRole('button', { name: edaUser2.username, exact: true })
        ).toBeVisible();
      });

      await test.step('Verify user2 cannot access projects', async () => {
        await navigateTo(page, 'Automation Decisions', 'Projects');
        await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();

        await expect(page.locator('.pf-v6-c-empty-state')).toBeVisible();
      });

      await test.step('Logout user2 and login back as admin', async () => {
        await logout(page, { username: edaUser2.username });
        await login(page);
      });
    });
  });
});
