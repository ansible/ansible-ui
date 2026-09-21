import { expect, Locator, Page } from '@playwright/test';

/**
 * Job output status test ids come from StatusCell/TextCell using the visible
 * English status label (e.g. "Success" -> success-status). Live E2E runs use en.
 */
export function jobOutputStatusLocator(page: Page): Locator {
  return page
    .getByTestId('running-status')
    .or(page.getByTestId('success-status'))
    .or(page.getByTestId('failed-status'))
    .or(page.getByTestId('error-status'))
    .or(page.getByTestId('waiting-status'))
    .or(page.getByTestId('pending-status'));
}

export function jobOutputTerminalStatusLocator(page: Page): Locator {
  return page
    .getByTestId('success-status')
    .or(page.getByTestId('failed-status'))
    .or(page.getByTestId('error-status'))
    .or(page.getByTestId('canceled-status'));
}

/** Job-level status in JobStatusBar (avoids page-title h1 and host rows). */
export function jobOutputJobStatusBarLocator(page: Page): Locator {
  return page.getByTestId('job-status-bar');
}

export function jobOutputHeaderStatusLocator(page: Page): Locator {
  return jobOutputJobStatusBarLocator(page).locator('[data-testid$="-status"]');
}

export function jobOutputHeaderTerminalStatusLocator(page: Page): Locator {
  const bar = jobOutputJobStatusBarLocator(page);
  return bar
    .getByTestId('success-status')
    .or(bar.getByTestId('failed-status'))
    .or(bar.getByTestId('error-status'))
    .or(bar.getByTestId('canceled-status'));
}

export function jobOutputRunningOrTerminalStatusLocator(page: Page): Locator {
  return page.getByTestId('running-status').or(jobOutputTerminalStatusLocator(page));
}

export function jobOutputHeaderRunningOrTerminalStatusLocator(page: Page): Locator {
  const bar = jobOutputJobStatusBarLocator(page);
  return bar
    .getByTestId('running-status')
    .or(bar.getByTestId('success-status'))
    .or(bar.getByTestId('failed-status'))
    .or(bar.getByTestId('error-status'))
    .or(bar.getByTestId('canceled-status'));
}

export async function expectJobOutputStatusVisible(
  page: Page,
  options?: { timeout?: number }
): Promise<void> {
  await expect(jobOutputStatusLocator(page)).toBeVisible({
    timeout: options?.timeout ?? 15_000,
  });
}

export async function expectJobOutputRunningOrTerminal(
  page: Page,
  options?: { timeout?: number }
): Promise<void> {
  await expect(jobOutputHeaderRunningOrTerminalStatusLocator(page)).toBeVisible({
    timeout: options?.timeout ?? 60_000,
  });
}

export async function expectJobOutputHeaderTerminal(
  page: Page,
  options?: { timeout?: number }
): Promise<void> {
  await expect(jobOutputHeaderTerminalStatusLocator(page)).toBeVisible({
    timeout: options?.timeout ?? 60_000,
  });
}

export async function expectJobOutputSuccess(
  page: Page,
  options?: { timeout?: number }
): Promise<void> {
  const timeout = options?.timeout ?? 120_000;
  const successStatus = page.getByTestId('success-status');
  const failedStatus = page.getByTestId('failed-status');
  const errorStatus = page.getByTestId('error-status');

  await expect(successStatus.or(failedStatus).or(errorStatus)).toBeVisible({ timeout });
  await expect(successStatus).toBeVisible();
}
