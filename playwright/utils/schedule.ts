import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../commands/clickPageAction';
import { clickTableRow } from '../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../commands/confirmAndAssertDeletion';
import { createE2EName } from '../commands/createE2EName';
import { navigateTo } from '../commands/navigateTo';
import { Inventory } from './inventory';
import { JobTemplate } from './jobTemplate';

export interface CreateScheduleOptions {
  scheduleName?: string;
  withPrompts?: boolean;
  withSurvey?: boolean;
  withExceptions?: boolean;
  endingType?: 'never' | 'count' | 'until';
  countValue?: number;
  untilDate?: string;
  timezone?: string;
  jobTemplateName?: string;
  inventoryName?: string;
  jobTags?: string;
  skipTags?: string;
  extraVars?: string;
  surveyQuestion?: string;
}

export const Schedule = {
  ui: {
    createJobTemplateSchedule: async (
      page: Page,
      options: CreateScheduleOptions = {}
    ): Promise<{ scheduleName: string; jobTemplateName: string; inventoryName: string }> => {
      // NOTE: This function creates inventory and job template if not provided.
      // Callers should handle cleanup of those resources separately.
      const inventoryName = options.inventoryName ?? (await Inventory.ui.create(page));
      const jobTemplateName =
        options.jobTemplateName ??
        (await JobTemplate.ui.create(page, {
          inventoryName: inventoryName,
          jobTagsPrompt: options.withPrompts,
          skipTagsPrompt: options.withPrompts,
          extraVarsPrompt: options.withPrompts,
          survey: options.withSurvey,
        }));
      await navigateTo(page, 'Automation Execution', 'Schedules');
      await page.getByRole('link', { name: 'Create schedule' }).click();
      await expect(page.getByRole('heading', { name: 'Create schedule' })).toBeVisible();
      const scheduleName = options.scheduleName ?? createE2EName();
      await page.getByRole('button', { name: 'Select resource type' }).click();
      await page.getByRole('option', { name: 'Job template', exact: true }).click();
      await page.getByLabel('Job template *').click();
      await page.getByRole('textbox', { name: 'Search input' }).fill(jobTemplateName);
      await page.getByRole('option', { name: jobTemplateName }).click();
      await page.getByRole('textbox', { name: 'Schedule name' }).click();
      await page.getByRole('textbox', { name: 'Schedule name' }).fill(scheduleName);
      await page.getByTestId('description').fill('This is a schedule description');
      await page.waitForTimeout(1000);

      if (options.timezone) {
        await page.getByLabel('Time zone').click();
        await page.getByRole('option', { name: options.timezone, exact: true }).click();
      }

      await page.getByRole('button', { name: 'Next' }).click();

      if (options.withPrompts) {
        if (options.jobTags) {
          await expect(page.getByText('Job tags')).toBeVisible();
          await page.getByPlaceholder('Select or create job tags').fill(options.jobTags);
          await page.getByRole('option', { name: `Create "${options.jobTags}"` }).click();
        }
        if (options.skipTags) {
          await expect(page.getByText('Skip tags')).toBeVisible();
          await page.getByPlaceholder('Select or create skip tags').fill(options.skipTags);
          await page.getByRole('option', { name: `Create "${options.skipTags}"` }).click();
        }
        if (options.extraVars) {
          await expect(page.getByText('Variables')).toBeVisible();
          await page.locator('.view-lines').first().click();
          const varsEditor = page.locator('.monaco-editor').first().getByRole('textbox');
          await varsEditor.fill(options.extraVars);
        }
        await page.getByRole('button', { name: 'Next' }).click();
      }

      if (options.withSurvey) {
        await expect(page.getByText('Question')).toBeVisible();
        await page.getByLabel('Question 1').fill(options.surveyQuestion ?? '');
        await page.getByRole('button', { name: 'Next' }).click();
      }

      if (options.endingType === 'count' && options.countValue) {
        await page.getByRole('button', { name: 'Schedule ending type' }).click();
        await page.waitForSelector('role=listbox');
        await page.getByRole('option', { name: 'Count Stop after a number of runs' }).click();
        await page.getByLabel('Count').fill(options.countValue.toString());
        await page.getByRole('button', { name: 'Save rule' }).click();
      } else if (options.endingType === 'until' && options.untilDate) {
        await page.getByRole('button', { name: 'Yearly' }).click();
        await page.getByRole('option', { name: 'Minutely', exact: true }).click();
        await page.getByRole('button', { name: 'Schedule ending type' }).click();
        await page.waitForSelector('role=listbox');
        await page.getByRole('option', { name: 'Until Stop on a specific date' }).click();
        await page.getByRole('textbox', { name: 'Date picker' }).fill(options.untilDate);
        await page.getByRole('textbox', { name: 'Time picker' }).fill('11:59 PM');
        await page.getByRole('button', { name: 'Save rule' }).click();
      } else {
        await page.getByRole('button', { name: 'Save rule' }).click();
      }
      await expect(page.getByRole('heading', { name: 'Schedule Rules' })).toBeVisible();
      await page.getByRole('button', { name: 'Next' }).click();

      if (options.withExceptions) {
        await expect(page.getByRole('heading', { name: 'Schedule Exceptions' })).toBeVisible();
        await page.getByRole('button', { name: 'Create exception' }).click();
        await page.getByRole('button', { name: 'Yearly' }).click();
        await page.getByRole('option', { name: 'Weekly', exact: true }).click();
        await page.getByLabel('Interval').fill('200');
        await page.getByRole('button', { name: 'Save exception' }).click();
        await expect(page.getByTestId('next-exclusion-timestamps-column-cell')).toBeVisible();
        await page.getByRole('button', { name: 'Next' }).click();
      } else {
        await page.getByRole('button', { name: 'Next' }).click();
      }

      await expect(page.getByTestId('Review')).toBeVisible();
      await expect(page.getByText(scheduleName)).toBeVisible();
      await expect(page.getByText('This is a schedule description')).toBeVisible();

      if (options.jobTags) {
        await expect(page.getByText(options.jobTags)).toBeVisible();
      }
      if (options.skipTags) {
        await expect(page.getByText(options.skipTags)).toBeVisible();
      }
      if (options.extraVars) {
        await expect(page.getByTestId('code-block-value')).toContainText(options.extraVars);
      }
      if (options.surveyQuestion) {
        await expect(page.getByTestId('code-block-value')).toContainText(options.surveyQuestion);
      }
      await page.getByRole('button', { name: 'Finish' }).click();
      await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible({
        timeout: 10000,
      });
      return { scheduleName, jobTemplateName, inventoryName };
    },

    delete: async (page: Page, scheduleName: string): Promise<void> => {
      await navigateTo(page, 'Automation Execution', 'Schedules');
      await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
      await clickPageAction('Delete schedule', page);
      await confirmAndAssertDeletion(page);
    },

    toggle: async (
      page: Page,
      scheduleName: string,
      location: 'details' | 'list'
    ): Promise<void> => {
      if (location === 'details') {
        await navigateTo(page, 'Automation Execution', 'Schedules');
        await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
        await expect(page.getByRole('heading', { name: scheduleName, exact: true })).toBeVisible();
        await page.getByLabel('Actions').click();
        const toggleButton = page.getByRole('switch', {
          name: /Click to (enable|disable) schedule/,
        });
        await toggleButton.click();
      } else {
        await navigateTo(page, 'Automation Execution', 'Schedules');
        await clickTableRow({ text: scheduleName, filterLabel: 'Name', clearFilters: false }, page);
        const row = page.getByRole('row', { name: new RegExp(scheduleName) });
        const toggleButton = row.getByRole('switch', {
          name: /Click to (enable|disable) schedule/,
        });
        await toggleButton.click();
      }
    },
  },
} as const;
