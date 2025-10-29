import { Page, expect } from '@playwright/test';
import { clickRetryUntilGone } from './clickRetryUntilGone';

export interface AdHocCommandOptions {
  module: string;
  moduleArgs: string;
  verbosity: string;
  limit: string;
  forks: number;
  showChanges: boolean;
  becomeEnabled: boolean;
  executionEnvironmentName: string;
  credentialName: string;
}

export async function runAdHocCommandWizard(options: AdHocCommandOptions, page: Page) {
  // Wait for the wizard page to load
  await expect(page.getByRole('heading', { name: 'Run command' })).toBeVisible();

  // Select module
  await page.getByRole('button', { name: 'Select a module' }).click();
  await page.getByRole('option', { name: options.module }).click();

  // Fill module arguments
  await page.getByPlaceholder('Enter arguments').fill(options.moduleArgs);

  // Select verbosity if not default
  if (options.verbosity !== '0') {
    await page.getByRole('button', { name: '0 (Normal)' }).click();
    await page.getByRole('option', { name: options.verbosity }).click();
  }

  // Verify and update limit if different from default
  const limitField = page.getByRole('textbox', { name: 'Limit' });
  const currentLimit = await limitField.inputValue();
  if (currentLimit !== options.limit) {
    await limitField.fill(options.limit);
  }

  // Set forks
  await page.getByRole('spinbutton', { name: 'Forks' }).fill(options.forks.toString());

  // Enable show changes if requested
  if (options.showChanges) {
    const showChangesSwitch = page.getByRole('switch', { name: 'Show changes' });
    const isChecked = await showChangesSwitch.isChecked();
    if (!isChecked) {
      await showChangesSwitch.check({ force: true });
    }
  }

  // Enable privilege escalation if requested
  if (options.becomeEnabled) {
    const becomeCheckbox = page.getByRole('checkbox', { name: 'Privilege escalation' });
    const isChecked = await becomeCheckbox.isChecked();
    if (!isChecked) {
      await becomeCheckbox.click();
    }
  }

  // Click Next to go to Execution Environment step
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for Execution Environment step to load and select execution environment
  const eeButton = page.getByTestId('executionEnvironment');
  await expect(eeButton).toBeVisible();
  await eeButton.click();
  await page.getByRole('option', { name: options.executionEnvironmentName }).click();

  // Click Next to go to Credential step
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for Credential step to load and click the credential dropdown
  const credentialButton = page.getByTestId('credential');
  await expect(credentialButton).toBeVisible();
  await credentialButton.click();

  // Wait for dropdown to expand and click Browse button
  const browseButton = page.getByRole('button', { name: 'Browse' });
  await expect(browseButton).toBeVisible();
  await browseButton.click();

  // Wait for credential dialog with specific name
  const credentialDialog = page.getByRole('dialog', { name: 'Credential' });
  await expect(credentialDialog).toBeVisible();

  // Find and click the credential row by name (this also selects the radio button)
  const credentialRow = credentialDialog.getByRole('row', {
    name: new RegExp(options.credentialName),
  });
  await expect(credentialRow).toBeVisible();
  await credentialRow.click();

  // Click Confirm to select the credential
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(credentialDialog).not.toBeVisible();

  // Click Next to go to Review step
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for Review step and click Finish
  const finishButton = page.getByRole('button', { name: 'Finish' });
  await expect(finishButton).toBeVisible();
  await finishButton.click();

  // Wait for job to start and verify we're on the job output page
  await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible({ timeout: 15000 });

  // Cancel running job to allow deletion of inventory host
  await page.waitForSelector('[data-testid="running-status"]');

  await page.getByRole('button', { name: 'Cancel job' }).click();
  const confirmCheckbox = page.locator('#confirm');
  await expect(confirmCheckbox).toBeVisible();
  await expect(confirmCheckbox).toBeEnabled();

  // Click the confirmation checkbox
  await confirmCheckbox.click();

  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Cancel job' }).click();

  // Check if Retry button exists and click it until it's gone
  try {
    const retryButton = page.getByRole('button', { name: 'Retry' });
    await retryButton.waitFor({ state: 'visible', timeout: 2000 });
    await clickRetryUntilGone(page);
  } catch {
    // Intentionally empty - no retry button found, exit normally
  }
}
