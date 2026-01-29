import type { EventStreamOut } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { Page, expect } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export interface CreateEventStreamOptions {
  credentialName?: string;
  organizationName?: string;
}

export const EventStream = {
  api: {
    delete: async (page: Page, eventStreamId: number): Promise<void> => {
      await edaAPI.delete(page, `event-streams/${eventStreamId}/`);
    },

    deleteByName: async (page: Page, eventStreamName: string): Promise<void> => {
      try {
        const eventStreams = await edaAPI.get<{ results: EventStreamOut[] }>(
          page,
          `event-streams/?name=${encodeURIComponent(eventStreamName)}`
        );
        if (eventStreams?.results && eventStreams.results.length > 0) {
          await edaAPI.delete(page, `event-streams/${eventStreams.results[0].id}/`);
        }
      } catch {
        // Already deleted or not found
      }
    },
  },

  ui: {
    create: async (page: Page, options: CreateEventStreamOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await page.getByText('Create credential').click();
      const credentialName = options.credentialName ?? createE2EName('event-stream');
      await page.getByPlaceholder('Enter credential name').fill(credentialName);
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
      await page.getByRole('button', { name: 'Credential type' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill('Basic Event Stream');
      await page.getByRole('option', { name: 'Basic Event Stream' }).click();
      await page.getByRole('textbox', { name: 'Username' }).click();
      await page.getByRole('textbox', { name: 'Username' }).fill('uname');
      await page.getByRole('textbox', { name: 'Password' }).click();
      await page.getByRole('textbox', { name: 'Password' }).fill('pwd');
      await page.getByRole('button', { name: 'Create credential' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();

      await navigateTo(page, 'Automation Decisions', 'Event Streams');
      await page.getByText('Create event stream').click();
      await page.getByRole('textbox', { name: 'Name' }).click();
      await page.getByRole('textbox', { name: 'Name' }).fill(credentialName);
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
      await page.getByRole('button', { name: 'Event stream type' }).click();
      await page.getByRole('option', { name: 'Basic Event Stream Credential' }).click();
      await page.getByRole('button', { name: 'Credential' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(credentialName);
      await page.getByRole('option', { name: credentialName }).click();
      await page.getByRole('button', { name: 'Create event stream' }).click();
      await expect(page.getByRole('heading', { name: credentialName, exact: true })).toBeVisible();

      return credentialName;
    },

    delete: async (page: Page, eventStreamName: string): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Event Streams');
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
      await clickPageAction('Delete event stream', page);
      await page.locator('#confirm').click();
      await page.locator('#submit').click();
      await expect(page.locator('[data-ouia-component-type="PF6/ModalContent"]')).toContainText(
        'Success'
      );

      await navigateTo(page, 'Automation Decisions', 'Infrastructure', 'Credentials');
      await clickTableRow(
        {
          text: eventStreamName,
          pageTitle: 'Credentials',
          filterLabel: 'Name',
          filterValue: eventStreamName,
          clearFilters: true,
        },
        page
      );
      await clickPageAction('Delete credential', page);
      await page.locator('#confirm').click();
      await page.locator('#submit').click();
      await expect(page.locator('[data-ouia-component-type="PF6/ModalContent"]')).toContainText(
        'Success'
      );
      await page.waitForTimeout(2000);
    },
  },
} as const;
