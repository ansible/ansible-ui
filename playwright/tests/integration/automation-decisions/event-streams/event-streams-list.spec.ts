import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { edaAPI } from '@ansible/playwright/commands/apiClient';
import { checkBuildType } from '@ansible/playwright/commands/checkBuildType';
import { clearTableFilters } from '@ansible/playwright/commands/clearTableFilters';
import { SAAS_URL } from '@ansible/playwright/commands/constants';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { filterTable } from '@ansible/playwright/commands/filterTable';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';
import { setupAfter, setupBefore } from '@ansible/playwright/commands/setup';
import { EdaCredential, EventStream, Organization } from '@ansible/playwright/utils';
import { EdaOrganization } from '@ansible/playwright/utils/edaOrganization';
import { expect, test } from '@playwright/test';

test.beforeEach(setupBefore({ path: '/decisions/event-streams' }));
test.afterEach(setupAfter);

test.describe('EDA Event Streams - List Operations', () => {
  let credentialId: number | undefined;
  let credentialName: string;
  let eventStream1Name: string;
  let eventStream2Name: string;
  let eventStream1Id: number | undefined;
  let eventStream2Id: number | undefined;
  let organization: PlatformOrganization;

  test.beforeEach(async ({ page }) => {
    organization = await Organization.api.create(page);
    const ansibleId = organization.summary_fields?.resource?.ansible_id;
    if (!ansibleId) {
      throw new Error('Platform organization missing ansible_id');
    }
    const edaOrganization = await EdaOrganization.api.getByAnsibleId(page, ansibleId);

    credentialName = createE2EName('event-stream-credential');
    eventStream1Name = createE2EName('event-stream');
    eventStream2Name = createE2EName('event-stream');

    // Create credential via API
    const credential = await EdaCredential.api.create(page, {
      name: credentialName,
      credentialTypeName: 'Basic Event Stream',
      description: 'Credential for event stream list tests',
      inputs: {
        username: 'testuser',
        password: 'testpass',
      },
    });
    credentialId = credential.id;

    // Create first event stream
    const eventStream1 = (await edaAPI.post(page, '/event-streams/', {
      name: eventStream1Name,
      event_stream_type: 'basic',
      eda_credential_id: credentialId,
      organization_id: edaOrganization.id,
    })) as { id: number };
    eventStream1Id = eventStream1.id;

    // Create second event stream
    const eventStream2 = (await edaAPI.post(page, '/event-streams/', {
      name: eventStream2Name,
      event_stream_type: 'basic',
      eda_credential_id: credentialId,
      organization_id: edaOrganization.id,
    })) as { id: number };
    eventStream2Id = eventStream2.id;
  });

  test.afterEach(async ({ page }) => {
    await Organization.api.delete(page, organization.id);
    if (eventStream1Id) {
      await EventStream.api.delete(page, eventStream1Id);
    }
    if (eventStream2Id) {
      await EventStream.api.delete(page, eventStream2Id);
    }
    if (credentialId) {
      await EdaCredential.api.delete(page, credentialId);
    }
  });

  test(
    'should render the Event Streams page and filter',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const buildType = await checkBuildType(page);
      if (buildType === SAAS_URL) {
        test.skip();
        return;
      }

      await test.step('Verify page title', async () => {
        await navigateTo(page, 'Automation Decisions', 'Event Streams');
        await expect(
          page.getByRole('heading', { name: 'Event Streams', exact: true })
        ).toBeVisible();
      });

      await test.step('Filter by first event stream name', async () => {
        await filterTable({ filterLabel: 'Name', filterValue: eventStream1Name }, page);
        await expect(page.getByRole('link', { name: eventStream1Name })).toBeVisible();
      });

      await test.step('Clear filters and filter by second event stream name', async () => {
        await page.getByRole('button', { name: 'Clear all filters' }).click();
        await filterTable({ filterLabel: 'Name', filterValue: eventStream2Name }, page);
        await expect(page.getByRole('link', { name: eventStream2Name })).toBeVisible();
      });
    }
  );

  test(
    'should toggle event stream test mode from list view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const buildType = await checkBuildType(page);
      if (buildType === SAAS_URL) {
        test.skip();
        return;
      }

      await test.step('Navigate and filter to event stream', async () => {
        await navigateTo(page, 'Automation Decisions', 'Event Streams');
        await filterTable({ filterLabel: 'Name', filterValue: eventStream1Name }, page);
        await expect(page.locator('tbody tr')).toHaveCount(1);
      });

      await test.step('Toggle switch to disable forwarding', async () => {
        const responsePromise = page.waitForResponse(
          (response) =>
            response.url().includes(`/event-streams/${eventStream1Id}/`) &&
            response.request().method() === 'PATCH' &&
            response.status() === 200
        );

        // Find the toggle switch in the row and click it
        const row = page.getByRole('row', { name: eventStream1Name });
        await row.getByTestId('toggle-switch').click();

        // Confirm in the dialog
        const dialog = page.getByRole('dialog', { name: 'Disable forwarding of events?' });
        await expect(dialog).toBeVisible();
        await dialog
          .getByRole('checkbox', {
            name: 'Yes, I confirm I want to disable the forwarding of events.',
          })
          .check();
        await dialog.getByRole('button', { name: 'Disable forwarding of events' }).click();

        // Verify success
        await expect(dialog).toContainText('Success');

        const response = await responsePromise;
        expect(response.status()).toBe(200);
      });
    }
  );

  test(
    'should bulk delete event streams from list view',
    { tag: ['@not_mock'] },
    async ({ page }) => {
      const buildType = await checkBuildType(page);
      if (buildType === SAAS_URL) {
        test.skip();
        return;
      }

      await test.step('Navigate and clear filters', async () => {
        await navigateTo(page, 'Automation Decisions', 'Event Streams');
        await clearTableFilters(page);
      });

      await test.step('Select first event stream', async () => {
        await filterTable({ filterLabel: 'Name', filterValue: eventStream1Name }, page);
        await expect(page.locator('tr', { hasText: eventStream1Name })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Select row' }).first().click();
        await clearTableFilters(page);
      });

      await test.step('Select second event stream', async () => {
        await filterTable({ filterLabel: 'Name', filterValue: eventStream2Name }, page);
        await expect(page.locator('tr', { hasText: eventStream2Name })).toBeVisible();
        await page.getByRole('checkbox', { name: 'Select row' }).first().click();
        await clearTableFilters(page);
      });

      await test.step('Delete selected event streams', async () => {
        const deleteResponsePromise1 = page.waitForResponse(
          (response) =>
            response.url().includes(`/event-streams/${eventStream1Id}/`) &&
            response.request().method() === 'DELETE' &&
            response.status() === 204
        );
        const deleteResponsePromise2 = page.waitForResponse(
          (response) =>
            response.url().includes(`/event-streams/${eventStream2Id}/`) &&
            response.request().method() === 'DELETE' &&
            response.status() === 204
        );

        // Click toolbar actions and select delete
        await page.getByRole('button', { name: 'toolbar actions' }).click();
        await page.getByRole('menuitem', { name: 'Delete selected event streams' }).click();

        // Confirm deletion
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.getByRole('checkbox', { name: 'Yes, I confirm that I want to' }).check();
        await dialog.getByRole('button', { name: 'Delete event streams' }).click();

        // Verify success
        await expect(dialog).toContainText('Success');

        const deleteResponse1 = await deleteResponsePromise1;
        const deleteResponse2 = await deleteResponsePromise2;
        expect(deleteResponse1.status()).toBe(204);
        expect(deleteResponse2.status()).toBe(204);

        // Mark as deleted
        eventStream1Id = undefined;
        eventStream2Id = undefined;
      });
    }
  );
});
