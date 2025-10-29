import { expect, Page } from '@playwright/test';
import { clickPageAction } from '@ansible/playwright/commands/clickPageAction';
import { clickTableRow } from '@ansible/playwright/commands/clickTableRow';
import { confirmAndAssertDeletion } from '@ansible/playwright/commands/confirmAndAssertDeletion';
import { createE2EName } from '@ansible/playwright/commands/createE2EName';
import { navigateTo } from '@ansible/playwright/commands/navigateTo';

export async function createRulebookActivation(
  options: {
    name?: string;
    projectName?: string;
    credentialName?: string;
    decisionEnvironmentName?: string;
    organizationName?: string;
    disabled?: boolean;
    restartPolicy?: 'Always' | 'On failure' | 'Never';
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
    const credentialSearch = page.locator('#credential-select-search input');
    await expect(credentialSearch).toBeVisible();
    await credentialSearch.fill(options.credentialName);
    const credentialOption = page.getByRole('menuitem', { name: options.credentialName });
    await expect(credentialOption).toBeVisible({ timeout: 10000 });
    await credentialOption.click();
  }

  await page.getByRole('button', { name: 'Decision Environment' }).click();
  const decisionEnvSearch = page.locator('#decision_environment_id-search input');
  await expect(decisionEnvSearch).toBeVisible();
  await decisionEnvSearch.fill(options.decisionEnvironmentName!);
  const decisionEnvOption = page.getByRole('option', { name: options.decisionEnvironmentName! });
  await expect(decisionEnvOption).toBeVisible({ timeout: 10000 });
  await decisionEnvOption.click();
  if (options?.restartPolicy) {
    await page.getByRole('button', { name: 'On failure' }).click();
    await page.getByRole('option', { name: options.restartPolicy }).click();
  }
  if (options?.disabled) {
    await page.getByRole('switch', { name: 'Rulebook activation enabled?' }).click({ force: true });
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
