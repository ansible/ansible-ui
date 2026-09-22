import { Page, expect } from '@playwright/test';
import { expectJobOutputHeaderAnyStatus, jobOutputJobStatusBarLocator } from './jobOutputStatus';
import { waitForBulkActionDialog } from './waitForBulkActionDialog';

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
  /** SSH password - required when credential has "Prompt on launch" for password */
  sshPassword?: string;
  /** Privilege escalation password - required when credential has "Prompt on launch" for become_password */
  becomePassword?: string;
  /** SSH key unlock password - required when credential has "Prompt on launch" for ssh_key_unlock */
  sshKeyUnlock?: string;
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
  await page.getByRole('textbox', { name: 'Search input' }).fill(options.executionEnvironmentName);
  await page.getByRole('option', { name: options.executionEnvironmentName }).click();

  // Click Next to go to Credential step
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for Credential step to load and click the credential dropdown
  const credentialButton = page.getByTestId('credential');
  await expect(credentialButton).toBeVisible();
  await credentialButton.click();

  await page.getByRole('textbox', { name: 'Search input' }).fill(options.credentialName);
  await page.getByRole('option', { name: options.credentialName }).click();

  // Click Next to go to next step (Credential Passwords or Review)
  await page.getByRole('button', { name: 'Next' }).click();

  // Handle Credential Passwords step if password fields need to be filled
  const hasCredentialPasswords =
    options.sshPassword || options.becomePassword || options.sshKeyUnlock;

  if (hasCredentialPasswords) {
    // Fill SSH password if provided
    if (options.sshPassword) {
      const sshPasswordField = page.getByTestId('run-command-ssh-password');
      await expect(sshPasswordField).toBeVisible({ timeout: 10000 });
      await sshPasswordField.fill(options.sshPassword);
    }

    // Fill privilege escalation password if provided
    if (options.becomePassword) {
      const becomePasswordField = page.getByTestId('run-command-privilege-escalation-password');
      await expect(becomePasswordField).toBeVisible({ timeout: 10000 });
      await becomePasswordField.fill(options.becomePassword);
    }

    // Fill SSH key unlock password if provided
    if (options.sshKeyUnlock) {
      const sshKeyUnlockField = page.getByTestId('run-command-private-key-passphrase');
      await expect(sshKeyUnlockField).toBeVisible({ timeout: 10000 });
      await sshKeyUnlockField.fill(options.sshKeyUnlock);
    }

    // Click Next to go to Review step
    await page.getByRole('button', { name: 'Next' }).click();
  }

  // Wait for Review step and click Finish
  const finishButton = page.getByRole('button', { name: 'Finish' });
  await expect(finishButton).toBeVisible();
  await finishButton.click();

  // Wait for job to start and verify we're on the job output page
  await expect(page.getByRole('tab', { name: 'Output' })).toBeVisible({ timeout: 15000 });

  const bar = jobOutputJobStatusBarLocator(page);
  const headerRunningStatus = bar.getByTestId('running-status');
  const cancelJob = page.getByRole('button', { name: 'Cancel job' });

  // Confirm the job page rendered. Pending/waiting jobs cannot be canceled, so
  // do not spend 60s waiting for Running — host delete already retries.
  await expectJobOutputHeaderAnyStatus(page);
  await expect(headerRunningStatus)
    .toBeVisible({ timeout: 30_000 })
    .catch(() => undefined);

  if (
    (await headerRunningStatus.isVisible().catch(() => false)) &&
    (await cancelJob.isEnabled().catch(() => false))
  ) {
    await cancelJob.click();
    const confirmCheckbox = page.locator('#confirm');
    await expect(confirmCheckbox).toBeVisible();
    await expect(confirmCheckbox).toBeEnabled();

    await confirmCheckbox.click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: /Cancel job/ }).click();

    if (await dialog.isVisible().catch(() => false)) {
      await waitForBulkActionDialog(page, { timeout: 15_000, allowFailure: true });
    }

    await expect(headerRunningStatus)
      .toBeHidden({ timeout: 15_000 })
      .catch(() => undefined);
  }

  const leftoverDialog = page.getByRole('dialog');
  if (await leftoverDialog.isVisible().catch(() => false)) {
    const closeBtn = leftoverDialog.getByRole('button', { name: 'Close' });
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    }
  }
}
