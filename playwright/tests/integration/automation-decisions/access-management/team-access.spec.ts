import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { DecisionEnvironment, EdaCredential, Team } from '@ansible/playwright/utils';
import { gatewayAPI } from '@ansible/playwright/commands/apiClient';
import { expect, test } from '@playwright/test';

interface RoleDefinition {
  id: number;
  name: string;
}

interface AccessTabResource {
  name: string;
  navPath: string[];
  content_type: string;
  role: string;
}

// Only test credentials (standard flow) and decision-environments (table view toggle).
// Per-component content_type correctness is verified in Vitest.
const edaResources: AccessTabResource[] = [
  {
    name: 'credentials',
    navPath: ['Automation Decisions', 'Infrastructure', 'Credentials'],
    content_type: 'eda.edacredential',
    role: 'Eda Credential Admin',
  },
  {
    name: 'decision-environments',
    navPath: ['Automation Decisions', 'Decision Environments'],
    content_type: 'eda.decisionenvironment',
    role: 'Decision Environment Admin',
  },
];

async function createRoleTeamAssignment(
  page: import('@playwright/test').Page,
  objectId: number,
  roleDefinitionId: number,
  teamId: number,
  contentType: string
) {
  await gatewayAPI.post(page, 'role_team_assignments/', {
    object_id: objectId,
    content_type: contentType,
    role_definition: roleDefinitionId,
    team: teamId,
  });
}

async function getRoleDefinitionByName(
  page: import('@playwright/test').Page,
  roleName: string
): Promise<RoleDefinition> {
  const response = await gatewayAPI.get<{ results: RoleDefinition[] }>(
    page,
    `role_definitions/?name=${encodeURIComponent(roleName)}`
  );
  if (!response?.results?.length) {
    throw new Error(`Role definition '${roleName}' not found`);
  }
  return response.results[0];
}

interface ResourceContext {
  objectId: number;
  objectName: string;
  credentialId?: number;
  decisionEnvironmentId?: number;
}

async function createResourceForType(
  page: import('@playwright/test').Page,
  resourceType: string,
  suffix: string
): Promise<ResourceContext> {
  const ctx: ResourceContext = { objectId: 0, objectName: '' };

  if (resourceType === 'credentials') {
    const credential = await EdaCredential.api.create(page, {
      name: `e2e-ta-cred-${suffix}`,
      credentialTypeName: 'Red Hat Ansible Automation Platform',
      organizationName: 'Default',
      inputs: { host: 'https://1.1.1.1/', username: 'test', password: 'test' },
    });
    ctx.credentialId = credential.id;
    ctx.objectId = credential.id;
    ctx.objectName = credential.name;
  } else if (resourceType === 'decision-environments') {
    const de = await DecisionEnvironment.api.create(page, {
      name: `e2e-ta-de-${suffix}`,
    });
    ctx.decisionEnvironmentId = de.id;
    ctx.objectId = de.id;
    ctx.objectName = de.name;
  }

  return ctx;
}

async function cleanupResourceContext(page: import('@playwright/test').Page, ctx: ResourceContext) {
  if (ctx.decisionEnvironmentId)
    await DecisionEnvironment.api.delete(page, ctx.decisionEnvironmentId);
  if (ctx.credentialId) await EdaCredential.api.delete(page, ctx.credentialId);
}

test.describe('EDA Team Access - Assign and Remove Team Roles', () => {
  test.beforeEach(setupBefore({ path: '/' }));
  test.afterEach(setupAfter);

  for (const resource of edaResources) {
    test.describe(`${resource.name}`, () => {
      test(`should assign teams via team access tab`, { tag: ['@not_mock'] }, async ({ page }) => {
        test.setTimeout(3 * 60 * 1000);
        const suffix = `${Date.now()}`;
        let ctx: ResourceContext | undefined;
        let teamId: number | undefined;

        try {
          ctx = await createResourceForType(page, resource.name, suffix);

          const team = await Team.api.create(page, { organization: 1 });
          teamId = team.id;

          await test.step('Navigate to resource and open Team Access tab', async () => {
            await navigateTo(page, ...resource.navPath);

            if (resource.name === 'decision-environments') {
              await page.getByRole('button', { name: 'table view' }).click();
            }

            await clickTableRow(
              { filterLabel: 'Name', text: ctx!.objectName, clearFilters: true },
              page
            );
            await expect(page.getByRole('heading', { name: ctx!.objectName })).toBeVisible();
            await page.getByRole('tab', { name: 'Team Access' }).click();
          });

          await test.step('Run assign teams wizard', async () => {
            await page.getByRole('link', { name: 'Assign teams' }).click();
            await expect(page.getByRole('heading', { name: 'Select team(s)' })).toBeVisible();

            await selectTableRow({ filterLabel: 'Name', filterValue: team.name }, page);
            await page.getByRole('button', { name: 'Next', exact: true }).click();

            await expect(
              page.getByRole('heading', { name: 'Select roles to apply' })
            ).toBeVisible();
            await selectTableRow(
              {
                pageTitle: 'Select roles to apply',
                filterLabel: 'Name',
                filterValue: resource.role,
              },
              page
            );
            await page.getByRole('button', { name: 'Next', exact: true }).click();

            await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
            await page.getByRole('button', { name: 'Finish' }).click();
          });

          await test.step('Verify assignment succeeded', async () => {
            await expect(page.getByRole('heading', { name: ctx!.objectName })).toBeVisible();
            await page.getByRole('tab', { name: 'Details' }).click();
            await page.getByRole('tab', { name: 'Team Access' }).click();
            await expect(page.getByRole('link', { name: team.name })).toBeVisible();
          });
        } finally {
          if (ctx) await cleanupResourceContext(page, ctx);
          if (teamId) await Team.api.delete(page, teamId);
        }
      });

      test(`should bulk remove team assignments`, { tag: ['@not_mock'] }, async ({ page }) => {
        test.setTimeout(3 * 60 * 1000);
        const suffix = `${Date.now()}`;
        let ctx: ResourceContext | undefined;
        let team1Id: number | undefined;
        let team2Id: number | undefined;
        let team3Id: number | undefined;

        try {
          ctx = await createResourceForType(page, resource.name, suffix);

          const team1 = await Team.api.create(page, { organization: 1 });
          team1Id = team1.id;
          const team2 = await Team.api.create(page, { organization: 1 });
          team2Id = team2.id;
          const team3 = await Team.api.create(page, { organization: 1 });
          team3Id = team3.id;

          const roleDef = await getRoleDefinitionByName(page, resource.role);
          await createRoleTeamAssignment(
            page,
            ctx.objectId,
            roleDef.id,
            team1.id,
            resource.content_type
          );
          await createRoleTeamAssignment(
            page,
            ctx.objectId,
            roleDef.id,
            team2.id,
            resource.content_type
          );
          await createRoleTeamAssignment(
            page,
            ctx.objectId,
            roleDef.id,
            team3.id,
            resource.content_type
          );

          await test.step('Navigate to resource Team Access tab', async () => {
            await navigateTo(page, ...resource.navPath);

            if (resource.name === 'decision-environments') {
              await page.getByRole('button', { name: 'table view' }).click();
            }

            await clickTableRow(
              { filterLabel: 'Name', text: ctx!.objectName, clearFilters: true },
              page
            );
            await expect(page.getByRole('heading', { name: ctx!.objectName })).toBeVisible();
            await page.getByRole('tab', { name: 'Team Access' }).click();
          });

          await test.step('Select two teams and bulk remove', async () => {
            const team2Row = page.locator('table tbody tr', { hasText: team2.name });
            await team2Row.getByRole('checkbox').check();

            const team3Row = page.locator('table tbody tr', { hasText: team3.name });
            await team3Row.getByRole('checkbox').check();

            await page.getByRole('button', { name: 'toolbar actions' }).click();
            await page.getByRole('menuitem', { name: 'Remove roles' }).click();
            await expect(page.getByRole('heading', { name: 'Remove role' })).toBeVisible();
            await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
            await page.getByRole('dialog').getByRole('button', { name: 'Remove role' }).click();

            await expect(page.locator('table tbody tr', { hasText: team2.name })).toHaveCount(0);
            await expect(page.locator('table tbody tr', { hasText: team3.name })).toHaveCount(0);
          });
        } finally {
          if (ctx) await cleanupResourceContext(page, ctx);
          if (team1Id) await Team.api.delete(page, team1Id);
          if (team2Id) await Team.api.delete(page, team2Id);
          if (team3Id) await Team.api.delete(page, team3Id);
        }
      });
    });
  }
});
