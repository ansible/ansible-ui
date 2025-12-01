import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { singleSelectByLabel } from '../commands/singleSelectByLabel';

export interface CreateExecutionEnvironmentOptions {
  executionEnvName?: string;
  organizationName?: string;
}

export const ExecutionEnvironment = {
  ui: {
    create: async (
      page: Page,
      options: CreateExecutionEnvironmentOptions = {}
    ): Promise<string> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
      await page.getByText('Create execution environment', { exact: true }).click();
      const executionEnvName = options.executionEnvName ?? createE2EName();
      await page.getByPlaceholder('Enter execution environment').fill(executionEnvName);
      await page.getByPlaceholder('Enter image').fill('myimage');

      if (options.organizationName) {
        await singleSelectByLabel('Organization', options.organizationName, page);
      }

      await page.getByRole('button', { name: 'Create execution environment' }).click();
      await expect(
        page.getByRole('heading', { name: executionEnvName, exact: true })
      ).toBeVisible();
      return executionEnvName;
    },

    delete: async (page: Page, executionEnvName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Infrastructure', 'Execution Environments');
      await clickTableRow({ filterLabel: 'Name', text: executionEnvName }, page);
      await clickPageAction('Delete execution environment', page);
      await confirmAndAssertDeletion(page);
    },
  },
} as const;
