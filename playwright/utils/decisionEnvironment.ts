import { Page, expect } from '@playwright/test';
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
  },
} as const;
