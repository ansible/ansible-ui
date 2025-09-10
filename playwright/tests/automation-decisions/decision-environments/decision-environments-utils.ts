import { Page, expect } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';
import { singleSelectByLabel } from '../../../commands/singleSelectByLabel';

export async function createDecisionEnvironment(
  options: { decisionEnvironmentName?: string; organizationName?: string },
  page: Page
) {
  await navigateTo(page, 'Automation Decisions', 'Decision Environments');
  await page.getByText('Create decision environment').click();
  const decisionEnvironmentName =
    options.decisionEnvironmentName ?? createE2EName('decision-environment');
  await page.getByRole('textbox', { name: 'Name' }).fill(decisionEnvironmentName);
  await singleSelectByLabel('Organization', options.organizationName ?? 'Default', page);
  await page.getByLabel('Image').fill('repo/project/image-name:tag');
  await page.getByRole('button', { name: 'Create decision environment', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: decisionEnvironmentName, exact: true })
  ).toBeVisible();
  return { decisionEnvironmentName };
}

export async function deleteDecisionEnvironment(decisionEnvironmentName: string, page: Page) {
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
}
