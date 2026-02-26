import type { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { Page, expect } from '@playwright/test';
import { edaAPI } from '../commands/apiClient';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export interface CreateDecisionEnvironmentOptions {
  decisionEnvironmentName?: string;
  organizationName?: string;
  pullPolicy?: string;
}

export const DecisionEnvironment = {
  api: {
    create: async (
      page: Page,
      options: {
        name?: string;
        organizationId?: number;
        imageUrl?: string;
        description?: string;
      } = {}
    ): Promise<EdaDecisionEnvironment> => {
      const name = options.name ?? createE2EName('decision-environment');
      const payload = {
        name,
        organization_id: options.organizationId ?? 1, // Default organization
        image_url: options.imageUrl ?? 'quay.io/ansible/ansible-rulebook:main',
        ...(options.description && { description: options.description }),
      };

      const result = await edaAPI.post<EdaDecisionEnvironment>(
        page,
        'decision-environments/',
        payload
      );
      if (!result) {
        throw new Error('Failed to create decision environment');
      }
      return result;
    },

    delete: async (page: Page, decisionEnvironmentId: number): Promise<void> => {
      await edaAPI.delete(page, `decision-environments/${decisionEnvironmentId}/`);
    },

    deleteByName: async (page: Page, decisionEnvironmentName: string): Promise<void> => {
      try {
        const environments = await edaAPI.get<{ results: EdaDecisionEnvironment[] }>(
          page,
          `decision-environments/?name=${encodeURIComponent(decisionEnvironmentName)}`
        );
        if (environments?.results && environments.results.length > 0) {
          await edaAPI.delete(page, `decision-environments/${environments.results[0].id}/`);
        }
      } catch {
        // Already deleted or not found
      }
    },
  },

  ui: {
    create: async (page: Page, options: CreateDecisionEnvironmentOptions = {}): Promise<string> => {
      await navigateTo(page, 'Automation Decisions', 'Decision Environments');
      await page.getByText('Create decision environment').click();
      const decisionEnvironmentName =
        options.decisionEnvironmentName ?? createE2EName('decision-environment');
      await page.getByRole('textbox', { name: 'Name' }).fill(decisionEnvironmentName);
      await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
      await page.getByLabel('Image').fill('quay.io/ansible/ansible-rulebook:main');

      if (options.pullPolicy) {
        const pullLabel = page.getByLabel('Pull');
        const isPullFieldVisible = await pullLabel.isVisible().catch(() => false);
        if (isPullFieldVisible) {
          await singleSelectByLabel('Pull', options.pullPolicy, page);
        }
      }

      await page.getByRole('button', { name: 'Create decision environment', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: decisionEnvironmentName, exact: true })
      ).toBeVisible();
      return decisionEnvironmentName;
    },

    delete: async (page: Page, decisionEnvironmentName: string): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Decision Environments');
      await page.getByRole('button', { name: 'table view' }).click();
      await clickTableRow(
        {
          text: decisionEnvironmentName,
          pageTitle: 'Decision Environments',
          filterLabel: 'Name',
          filterValue: decisionEnvironmentName,
          clearFilters: true,
        },
        page
      );
      await clickPageAction('Delete decision environment', page);
      await confirmAndAssertDeletion(page);
    },

    edit: async (
      page: Page,
      decisionEnvironmentName: string,
      updates: {
        name?: string;
        description?: string;
        imageUrl?: string;
      }
    ): Promise<void> => {
      await navigateTo(page, 'Automation Decisions', 'Decision Environments');
      await page.getByRole('button', { name: 'table view' }).click();
      await clickTableRow(
        {
          text: decisionEnvironmentName,
          pageTitle: 'Decision Environments',
          filterLabel: 'Name',
          filterValue: decisionEnvironmentName,
          clearFilters: true,
        },
        page
      );

      await clickPageAction('Edit decision environment', page);

      if (updates.name) {
        await page.getByRole('textbox', { name: 'Name', exact: true }).clear();
        await page.getByRole('textbox', { name: 'Name', exact: true }).fill(updates.name);
      }

      if (updates.description) {
        await page.getByRole('textbox', { name: 'Description' }).clear();
        await page.getByRole('textbox', { name: 'Description' }).fill(updates.description);
      }

      if (updates.imageUrl) {
        await page.getByLabel('Image').clear();
        await page.getByLabel('Image').fill(updates.imageUrl);
      }

      await page.getByRole('button', { name: 'Save decision environment', exact: true }).click();

      const updatedName = updates.name ?? decisionEnvironmentName;
      await expect(page.getByRole('heading', { name: updatedName, exact: true })).toBeVisible();
    },
  },
} as const;
