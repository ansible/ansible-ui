import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { isSaaS } from '@ansible/playwright/commands/getTopologyType';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { singleSelectByLabel } from '@ansible/playwright/commands/singleSelectByLabel';
import { EdaCredential, EventStream, Organization } from '@ansible/playwright/utils';
import { EdaOrganization } from '@ansible/playwright/utils/edaOrganization';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/event-streams' }));
test.afterEach(setupAfter);

test.describe('EDA Event Streams - CRUD Operations', () => {
  test(
    'should create an event stream and assert the information on details page',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      if (isSaaS()) {
        test.skip();
        return;
      }

      const eventStreamName = createE2EName('event-stream');
      const credentialName = createE2EName('event-stream-credential');
      let eventStreamCreated = false;
      let credentialId: number | undefined;

      try {
        await test.step('Create credential via API', async () => {
          const credential = await EdaCredential.api.create(page, {
            name: credentialName,
            credentialTypeName: 'Basic Event Stream',
            description: 'Credential for event stream test',
            inputs: {
              username: 'testuser',
              password: 'testpass',
            },
          });
          credentialId = credential.id;
        });

        await test.step('Navigate and start creation', async () => {
          await navigateTo(page, 'Automation Decisions', 'Event Streams');
          await expect(
            page.getByRole('heading', { name: 'Event Streams', exact: true })
          ).toBeVisible();
          await page.getByText('Create event stream').click();
        });

        await test.step('Verify create form loaded', async () => {
          await expect(
            page.getByRole('heading', { name: 'Create event stream', exact: true })
          ).toBeVisible();
        });

        await test.step('Fill event stream form', async () => {
          await page.getByRole('textbox', { name: 'Name', exact: true }).fill(eventStreamName);
          await singleSelectByLabel('Organization', 'Default', page);
        });

        await test.step('Select event stream type', async () => {
          await page.getByRole('button', { name: 'Event stream type' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill('Basic Event Stream');
          await page.getByRole('option', { name: 'Basic Event Stream Credential' }).click();
        });

        await test.step('Select credential', async () => {
          await page.getByRole('button', { name: 'Credential' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).click();
          await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
          await page.getByRole('option', { name: credentialName }).click();
        });

        await test.step('Submit and verify details', async () => {
          await page.getByRole('button', { name: 'Create event stream', exact: true }).click();
          await expect(
            page.getByRole('heading', { name: eventStreamName, exact: true })
          ).toBeVisible();
          eventStreamCreated = true;

          // Verify details page
          await expect(page.getByTestId('name')).toContainText(eventStreamName);
          await expect(page.getByTestId('event-stream-type')).toContainText('basic');
          await expect(page.getByTestId('url')).toContainText('external_event_stream');
        });
      } finally {
        // Cleanup event stream
        if (eventStreamCreated) {
          await EventStream.api.deleteByName(page, eventStreamName);
        }
        // Cleanup credential
        if (credentialId) {
          await EdaCredential.api.delete(page, credentialId);
        }
      }
    }
  );

  test('should edit an event stream', { tag: ['@not_mock'] }, async ({ page }) => {
    if (isSaaS()) {
      test.skip();
      return;
    }

    const organization = await Organization.api.create(page);
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);

    const eventStreamName = createE2EName('event-stream');
    const credentialName = createE2EName('event-stream-credential');
    let credentialId: number | undefined;

    try {
      await test.step('Create credential via API', async () => {
        const credential = await EdaCredential.api.create(page, {
          name: credentialName,
          credentialTypeName: 'Basic Event Stream',
          description: 'Credential for event stream edit test',
          inputs: {
            username: 'testuser',
            password: 'testpass',
          },
        });
        credentialId = credential.id;
      });

      await test.step('Create event stream via API', async () => {
        await EventStream.api.create(page, {
          name: eventStreamName,
          event_stream_type: 'basic',
          eda_credential_id: credentialId!,
          organization_id: edaOrganization.id,
          enabled: true,
        });
      });

      await test.step('Navigate to event stream details', async () => {
        await navigateTo(page, 'Automation Decisions', 'Event Streams');
        await expect(
          page.getByRole('heading', { name: 'Event Streams', exact: true })
        ).toBeVisible();

        await clickTableRow(
          {
            text: eventStreamName,
            pageTitle: 'Event Streams',
            filterLabel: 'Name',
            filterValue: eventStreamName,
            clearFilters: true,
          },
          page
        );
        await expect(
          page.getByRole('heading', { name: eventStreamName, exact: true })
        ).toBeVisible();
      });

      await test.step('Open edit form', async () => {
        await clickPageAction('Edit event stream', page);
        await expect(
          page.getByRole('heading', { name: `Edit ${eventStreamName}`, exact: true })
        ).toBeVisible();
      });

      await test.step('Modify name and save', async () => {
        await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
        await page
          .getByRole('textbox', { name: 'Name', exact: true })
          .fill(`${eventStreamName} edited`);
        await page.getByRole('button', { name: 'Save event stream', exact: true }).click();
        await expect(
          page.getByRole('heading', { name: `${eventStreamName} edited`, exact: true })
        ).toBeVisible();
      });
    } finally {
      await EventStream.api.deleteByName(page, eventStreamName);
      await EventStream.api.deleteByName(page, `${eventStreamName} edited`);
      await Organization.api.delete(page, organization.id);
      if (credentialId) {
        await EdaCredential.api.delete(page, credentialId);
      }
    }
  });

  test('should delete an event stream', { tag: ['@not_mock'] }, async ({ page }) => {
    if (isSaaS()) {
      test.skip();
      return;
    }
    const organization = await Organization.api.create(page);
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);

    const eventStreamName = createE2EName('event-stream');
    const credentialName = createE2EName('event-stream-credential');
    let eventStreamId: number | undefined;
    let credentialId: number | undefined;

    try {
      await test.step('Create credential via API', async () => {
        const credential = await EdaCredential.api.create(page, {
          name: credentialName,
          credentialTypeName: 'Basic Event Stream',
          description: 'Credential for event stream delete test',
          inputs: {
            username: 'testuser',
            password: 'testpass',
          },
        });
        credentialId = credential.id;
      });

      await test.step('Create event stream via API', async () => {
        const eventStream = await EventStream.api.create(page, {
          name: eventStreamName,
          event_stream_type: 'basic',
          eda_credential_id: credentialId!,
          organization_id: edaOrganization.id,
          enabled: true,
        });
        eventStreamId = eventStream.id;
      });

      await test.step('Navigate to event stream details', async () => {
        await navigateTo(page, 'Automation Decisions', 'Event Streams');
        await expect(
          page.getByRole('heading', { name: 'Event Streams', exact: true })
        ).toBeVisible();

        await clickTableRow(
          {
            text: eventStreamName,
            pageTitle: 'Event Streams',
            filterLabel: 'Name',
            filterValue: eventStreamName,
            clearFilters: true,
          },
          page
        );
        await expect(
          page.getByRole('heading', { name: eventStreamName, exact: true })
        ).toBeVisible();
      });

      await test.step('Delete and verify', async () => {
        const deleteResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/event-streams/') &&
            response.request().method() === 'DELETE' &&
            response.status() === 204
        );

        await clickPageAction('Delete event stream', page);
        await page.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await page.getByRole('button', { name: 'Delete event streams' }).click();

        const deleteResponse = await deleteResponsePromise;
        expect(deleteResponse.status()).toBe(204);
        await expect(page.getByTestId('page-title')).toHaveText('Event Streams');
        eventStreamId = undefined; // Mark as deleted
      });
    } finally {
      if (eventStreamId) {
        await EventStream.api.delete(page, eventStreamId);
      }
      await Organization.api.delete(page, organization.id);
      if (credentialId) {
        await EdaCredential.api.delete(page, credentialId);
      }
    }
  });
});
