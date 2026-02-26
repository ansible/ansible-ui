import { expect, test } from '@playwright/test';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { selectTableRow } from '@ansible/playwright/commands/selectTableRow';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { DecisionEnvironment, EdaCredential, Organization, User } from '@ansible/playwright/utils';
import type { EdaCredential as EdaCredentialType } from '@ansible/eda-ui/interfaces/EdaCredential';
import type { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import type { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';

test.beforeEach(setupBefore({ path: '/decisions/decision-environments' }));
test.afterEach(setupAfter);

interface AccessTabResource {
  name: string;
  content_type: string;
  role: string;
  path: string[];
}

const userAccessResources: AccessTabResource[] = [
  {
    name: 'decision-environments',
    content_type: 'eda.decision-environment',
    role: 'Decision Environment Admin',
    path: ['Automation Decisions', 'Decision Environments'],
  },
  {
    name: 'credentials',
    content_type: 'eda.edacredential',
    role: 'Eda Credential Admin',
    path: ['Automation Decisions', 'Infrastructure', 'Credentials'],
  },
];

test.describe('EDA User Access Tab - Add User', () => {
  let edaOrg: PlatformOrganization;
  let edaCredential: EdaCredentialType;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaUser1: PlatformUser;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(3 * 60 * 1000);

    edaOrg = await Organization.api.create(page, {
      name: createE2EName('organization'),
      description: 'Created for E2E testing',
    });

    edaCredential = await EdaCredential.api.create(page, {
      name: createE2EName('credential'),
      organizationName: edaOrg.name,
      credentialTypeName: 'Container Registry',
      inputs: {
        host: 'quay.io',
        username: 'test',
        password: 'test',
        verify_ssl: false,
      },
    });

    edaDecisionEnvironment = await DecisionEnvironment.api.create(page, {
      organizationId: edaOrg.id,
      imageUrl: 'quay.io/ansible/ansible-rulebook:main',
    });

    edaUser1 = await User.api.create(page);
  });

  test.afterEach(async ({ page }) => {
    if (edaUser1?.id) await User.api.delete(page, edaUser1.id).catch(() => {});
    if (edaDecisionEnvironment?.id)
      await DecisionEnvironment.api.delete(page, edaDecisionEnvironment.id).catch(() => {});
    if (edaCredential?.id) await EdaCredential.api.delete(page, edaCredential.id).catch(() => {});
    if (edaOrg?.id) await Organization.api.delete(page, edaOrg.id).catch(() => {});
  });

  for (const resource of userAccessResources) {
    test(
      `should add users via user access tab for ${resource.name}`,
      { tag: ['@not_mock'] },
      async ({ page }) => {
        test.setTimeout(3 * 60 * 1000);

        const resourceObject =
          resource.name === 'decision-environments' ? edaDecisionEnvironment : edaCredential;

        await test.step('Navigate to resource', async () => {
          await navigateTo(page, ...resource.path);

          await clickTableRow(
            {
              filterLabel: 'Name',
              text: resourceObject.name,
              clearFilters: true,
            },
            page
          );

          await expect(page.getByRole('heading', { name: resourceObject.name })).toBeVisible();
        });

        await test.step('Open User Access tab and start assignment wizard', async () => {
          await page.getByRole('tab', { name: 'User Access' }).click();
          await page.getByTestId('assign-users').click();
          await expect(page.getByRole('heading', { name: 'Assign users' })).toBeVisible();
        });

        await test.step('Select user', async () => {
          await expect(page.getByRole('heading', { name: 'Select user(s)' })).toBeVisible();
          await selectTableRow(
            {
              filterLabel: 'Username',
              filterValue: edaUser1.username,
            },
            page
          );
          await page.getByRole('button', { name: 'Next', exact: true }).click();
        });

        await test.step('Select role', async () => {
          await expect(page.getByRole('heading', { name: 'Select roles to apply' })).toBeVisible();
          await selectTableRow(
            {
              filterLabel: 'Name',
              filterValue: resource.role,
            },
            page
          );
          await page.getByRole('button', { name: 'Next', exact: true }).click();
        });

        await test.step('Review and submit', async () => {
          await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
          await expect(page.locator('main')).toContainText(edaUser1.username);
          await expect(page.locator('main')).toContainText(resource.role);

          const assignmentPromise = page.waitForResponse(
            (response) =>
              response.url().includes('/api/gateway/v1/role_user_assignments/') &&
              response.status() === 201
          );

          await page.getByRole('button', { name: 'Finish', exact: true }).click();

          const assignmentResponse = await assignmentPromise;
          expect(assignmentResponse.status()).toBe(201);
        });

        await test.step('Verify user assignment', async () => {
          await expect(page.getByRole('heading', { name: resourceObject.name })).toBeVisible();
          await page.getByRole('tab', { name: 'User Access' }).click();
          await expect(page.locator('main')).toContainText(edaUser1.username);
        });
      }
    );
  }
});
