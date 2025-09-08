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
    disabled?: boolean;
  },
  page: Page
) {
  const rulebookActivationName = options.name ?? createE2EName('rulebookActivation');
  const projectName = options.projectName ?? 'Demo Project';
  const credentialName = options.credentialName ?? 'Demo Credential';
  await navigateTo(page, 'Automation Decisions', 'Rulebook Activations');
  await page.getByText('Create rulebook activation').click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).click();
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill(rulebookActivationName);
  await page.getByRole('button', { name: 'Organization' }).click();
  await page.getByRole('option', { name: 'Default The default' }).click();
  await page.getByRole('button', { name: 'Project' }).click();
  await page.getByRole('textbox', { name: 'Search input' }).fill(projectName);

  await page.getByRole('option', { name: projectName }).click();
  await page.getByRole('button', { name: 'Rulebook', exact: true }).click();
  await page.getByRole('option', { name: 'basic_short.yml' }).click();
  await page
    .locator('#credential-select-form-group')
    .getByRole('button', { name: 'Options menu' })
    .click();
  await page.getByRole('textbox', { name: 'Type to filter' }).click();
  await page.getByRole('textbox', { name: 'Type to filter' }).fill(credentialName);
  await page.getByRole('button', { name: 'apply filter' }).click();
  await page.getByRole('checkbox', { name: 'Select row' }).check();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.locator('button[data-cy="decision-environment-id-form-group"]').click();
  await page.getByRole('option', { name: 'Automation Hub Default' }).click();
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
