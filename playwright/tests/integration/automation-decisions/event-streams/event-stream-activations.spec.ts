import { edaAPI } from '@ansible/playwright/commands/apiClient';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import {
  DecisionEnvironment,
  EdaCredential,
  EdaProject,
  Organization,
  RulebookActivation,
} from '@ansible/playwright/utils';
import { EdaOrganization } from '@ansible/playwright/utils/edaOrganization';
import type { EdaCredential as EdaCredentialType } from '@ansible/eda-ui/interfaces/EdaCredential';
import type { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import type { EventStreamOut } from '@ansible/eda-ui/interfaces/generated/eda-api';
import type { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/event-streams' }));
test.afterEach(setupAfter);

test.describe('Event Stream and Rulebook Activation Integration', () => {
  test.beforeAll(() => {
    if (isSaaS()) {
      test.skip(true, 'Event streams not available on SaaS deployments');
    }
  });

  let organization: PlatformOrganization;
  let edaOrgId: number;
  let projectName: string;
  let credential: EdaCredentialType;
  let decisionEnvironment: EdaDecisionEnvironment;
  let eventStreamCredential: EdaCredentialType;
  let eventStream: EventStreamOut;

  test.beforeEach(async ({ page }) => {
    // Create organization via API (fast)
    organization = await Organization.api.create(page);

    // Get the corresponding EDA organization
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);
    edaOrgId = edaOrganization.id;

    // Create project via UI (handles sync automatically)
    projectName = await EdaProject.ui.create(page, { organizationName: organization.name });

    // Create remaining resources via API (fast)
    credential = await EdaCredential.api.create(page, {
      name: createE2EName('credential'),
      organizationName: organization.name,
      credentialTypeName: 'Red Hat Ansible Automation Platform',
      inputs: {
        host: 'https://example.com',
        username: 'test_user',
        password: 'test_password',
      },
    });

    decisionEnvironment = await DecisionEnvironment.api.create(page, {
      organizationId: edaOrgId,
    });

    // Create event stream credential (Basic Event Stream type)
    eventStreamCredential = await EdaCredential.api.create(page, {
      name: createE2EName('event-stream-cred'),
      organizationName: organization.name,
      credentialTypeName: 'Basic Event Stream',
      inputs: {
        username: 'testuser',
        password: 'testpass',
      },
    });

    // Create event stream
    eventStream = (await edaAPI.post(page, 'event-streams/', {
      name: createE2EName('event-stream'),
      event_stream_type: 'basic',
      eda_credential_id: eventStreamCredential.id,
      organization_id: edaOrgId,
    })) as EventStreamOut;
  });

  test.afterEach(async ({ page }) => {
    // Clean up via API (fast)
    if (eventStream?.id) {
      await edaAPI.delete(page, `event-streams/${eventStream.id}/`).catch(() => {});
    }
    if (eventStreamCredential?.id) {
      await EdaCredential.api.delete(page, eventStreamCredential.id).catch(() => {});
    }
    if (decisionEnvironment?.id) {
      await DecisionEnvironment.api.delete(page, decisionEnvironment.id).catch(() => {});
    }
    if (credential?.id) {
      await EdaCredential.api.delete(page, credential.id).catch(() => {});
    }
    await EdaProject.api.deleteByName(page, projectName).catch(() => {});
    if (organization?.id) {
      await Organization.api.delete(page, organization.id).catch(() => {});
    }
  });

  test(
    'should navigate between activation and event stream and view linked resources',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);

      let rulebookActivationName: string;

      await test.step('Create rulebook activation with event stream mapping', async () => {
        // Create activation as disabled to avoid timing issues
        rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName: credential.name,
          decisionEnvironmentName: decisionEnvironment.name,
          organizationName: organization.name,
          disabled: true,
        });

        // Edit activation to add event stream mapping
        await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
        await page
          .locator('#source-mappings-form-group')
          .getByRole('button', { name: 'Options menu' })
          .click();
        await page.getByRole('button', { name: 'Rulebook source' }).click();
        await page.getByRole('option', { name: '__SOURCE_1' }).click();
        await page.getByRole('button', { name: 'Event stream' }).click();
        await page.getByRole('option', { name: eventStream.name }).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();

        // Verify event stream is linked
        await expect(page.getByRole('link', { name: eventStream.name })).toBeVisible();
      });

      await test.step('Navigate to rulebook activation details', async () => {
        await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
        await expect(page.getByRole('heading', { name: 'Rulebook Activations' })).toBeVisible();
        await clickTableRow(
          {
            text: rulebookActivationName,
            pageTitle: 'Rulebook Activations',
            filterLabel: 'Name',
            filterValue: rulebookActivationName,
            clearFilters: true,
          },
          page
        );
        await expect(
          page.getByRole('heading', { name: rulebookActivationName, exact: true })
        ).toBeVisible();
      });

      await test.step('Navigate to event stream from activation details', async () => {
        // Click the event stream link
        await page.getByRole('link', { name: eventStream.name }).click();
        await expect(
          page.getByRole('heading', { name: eventStream.name, exact: true })
        ).toBeVisible();
      });

      await test.step('View activations tab on event stream details', async () => {
        await page.getByRole('tab', { name: 'Activations' }).click();
        await expect(page.getByText(rulebookActivationName)).toBeVisible();
      });

      await test.step('Navigate back to activation from event stream activations tab', async () => {
        await clickTableRow(
          {
            text: rulebookActivationName,
            pageTitle: eventStream.name,
            filterLabel: 'Name',
            filterValue: rulebookActivationName,
            clearFilters: true,
          },
          page
        );
        await expect(
          page.getByRole('heading', { name: rulebookActivationName, exact: true })
        ).toBeVisible();
      });

      await test.step('Navigate to event stream again and verify activations tab', async () => {
        await page.getByRole('link', { name: eventStream.name }).click();
        await expect(
          page.getByRole('heading', { name: eventStream.name, exact: true })
        ).toBeVisible();
        await page.getByRole('tab', { name: 'Activations' }).click();
        await expect(page.getByText(rulebookActivationName)).toBeVisible();
      });

      await test.step('Clean up activation', async () => {
        await RulebookActivation.ui.delete(page, rulebookActivationName);
      });
    }
  );

  test(
    'should disable delete action for event stream when it is used by an activation',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      test.setTimeout(180000);

      let rulebookActivationName: string;

      await test.step('Create rulebook activation with event stream mapping', async () => {
        // Create activation as disabled to avoid timing issues
        rulebookActivationName = await RulebookActivation.ui.create(page, {
          projectName,
          credentialName: credential.name,
          decisionEnvironmentName: decisionEnvironment.name,
          organizationName: organization.name,
          disabled: true,
        });

        // Edit activation to add event stream mapping
        await page.getByRole('button', { name: 'Edit rulebook activation' }).click();
        await page
          .locator('#source-mappings-form-group')
          .getByRole('button', { name: 'Options menu' })
          .click();
        await page.getByRole('button', { name: 'Rulebook source' }).click();
        await page.getByRole('option', { name: '__SOURCE_1' }).click();
        await page.getByRole('button', { name: 'Event stream' }).click();
        await page.getByRole('option', { name: eventStream.name }).click();
        await page.getByRole('button', { name: 'Save' }).click();
        await page.getByRole('button', { name: 'Save rulebook activation' }).click();

        // Verify event stream is linked
        await expect(page.getByRole('link', { name: eventStream.name })).toBeVisible();
      });

      await test.step('Navigate to event stream details', async () => {
        await navigateTo(page, 'Automation Decisions', 'Event Streams');
        await expect(page.getByRole('heading', { name: 'Event Streams' })).toBeVisible();
        await clickTableRow(
          {
            text: eventStream.name,
            pageTitle: 'Event Streams',
            filterLabel: 'Name',
            filterValue: eventStream.name,
            clearFilters: true,
          },
          page
        );
        await expect(
          page.getByRole('heading', { name: eventStream.name, exact: true })
        ).toBeVisible();
      });

      await test.step('Verify delete action is disabled', async () => {
        await page.getByLabel('kebab dropdown toggle').click();
        await expect(page.getByRole('menuitem', { name: 'Delete event stream' })).toHaveAttribute(
          'aria-disabled',
          'true'
        );
      });

      await test.step('Clean up activation', async () => {
        await RulebookActivation.ui.delete(page, rulebookActivationName);
      });
    }
  );
});
