import { expect, Page } from '@playwright/test';
import { clickPageAction } from '../../../commands/clickPageAction';
import { clickTableRow } from '../../../commands/clickTableRow';
import { confirmAndAssertDeletion } from '../../../commands/confirmAndAssertDeletion';
import { createE2EName } from '../../../commands/createE2EName';
import { navigateTo } from '../../../commands/navigateTo';

export async function createRulebookActivation(
  options: {
    name?: string;
    projectName?: string;
    credentialName?: string;
    decisionEnvironmentName?: string;
    organizationName?: string;
    disabled?: boolean;
  },
  page: Page
) {
  const rulebookActivationName = options.name ?? createE2EName('rulebookActivation');
  const projectName = options.projectName ?? 'Demo Project';
  await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
  await page.getByText('Create rulebook activation').click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(rulebookActivationName);
  await page.getByRole('button', { name: 'Organization' }).click();
  await page
    .locator('#organization_id-search')
    .getByRole('textbox', { name: 'Search input' })
    .click();
  await page
    .locator('#organization_id-search')
    .getByRole('textbox', { name: 'Search input' })
    .fill(options.organizationName ?? 'Default');
  await page.getByRole('button', { name: 'Project' }).click();
  await expect(
    page.locator('#project_id-search').getByRole('textbox', { name: 'Search input' })
  ).toBeVisible();
  await page
    .locator('#project_id-search')
    .getByRole('textbox', { name: 'Search input' })
    .fill(projectName);
  await expect(page.getByRole('option', { name: projectName })).toBeVisible();

  await page.getByRole('option', { name: projectName }).click();
  await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
  await page.getByRole('option', { name: 'hello_echo.yml' }).click();

  if (options.credentialName) {
    await page.getByRole('button', { name: 'Credential' }).click();
    await page.getByRole('textbox', { name: 'Search input' }).click();
    await page.getByRole('textbox', { name: 'Search input' }).fill(options.credentialName);
    await page.getByText(options.credentialName).click();
  }

  await page.getByRole('button', { name: 'Decision Environment' }).click();
  await page.getByRole('option', { name: options.decisionEnvironmentName }).click();
  if (options?.disabled) {
    await page.locator('label:has([data-cy="rulebook-activation-toggle"])').click();
  }
  await page.getByRole('button', { name: 'Create rulebook activation' }).click();
  await expect(page.locator('#name')).toHaveValue(rulebookActivationName);
  return rulebookActivationName;
}

export async function deleteRulebookActivation(rulebookActivationName: string, page: Page) {
  await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');

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

  await clickPageAction('Delete rulebook activation', page);
  await confirmAndAssertDeletion(page);
}
