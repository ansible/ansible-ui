import { Page } from '@playwright/test';
import { awxAPI } from './apiClient';

/**
 * Options for waitForJobStatus function
 */
export interface WaitForJobStatusOptions {
  /**
   * The job resource type endpoint (e.g., 'jobs', 'workflow_jobs', 'inventory_updates', 'project_updates', 'system_jobs')
   */
  jobType: string;

  /**
   * The ID of the job to monitor
   */
  jobId: number | string;

  /**
   * The desired status(es) to wait for. Can be a single status or an array of acceptable statuses.
   * Common statuses: 'pending', 'waiting', 'running', 'successful', 'failed', 'error', 'canceled'
   */
  desiredStatus: string | string[];

  /**
   * Maximum time to wait in milliseconds (default: 120000 = 2 minutes)
   */
  timeout?: number;

  /**
   * Interval between status checks in milliseconds (default: 2000 = 2 seconds)
   */
  pollingInterval?: number;

  /**
   * Whether to throw an error if job reaches 'failed' or 'error' status while waiting for a different status
   * (default: true)
   */
  throwOnFailure?: boolean;
}

/**
 * Generic job status response interface
 */
export interface JobStatusResponse {
  id: number;
  status: string;
  [key: string]: unknown;
}

/**
 * Wait for a job to reach a desired status by polling the API
 *
 * This utility works with multiple job types including:
 * - Inventory Sync jobs ('inventory_updates')
 * - Project Sync jobs ('project_updates')
 * - Job template jobs ('jobs')
 * - Workflow job template jobs ('workflow_jobs')
 * - Workflow node runs ('workflow_job_nodes')
 * - Management jobs ('system_jobs')
 *
 * @example
 * ```typescript
 * // Wait for a project update to succeed
 * const projectUpdate = await waitForJobStatus({
 *   page,
 *   jobType: 'project_updates',
 *   jobId: 123,
 *   desiredStatus: 'successful'
 * });
 *
 * // Wait for inventory sync to complete (success or failure)
 * const inventoryUpdate = await waitForJobStatus({
 *   page,
 *   jobType: 'inventory_updates',
 *   jobId: 456,
 *   desiredStatus: ['successful', 'failed'],
 *   throwOnFailure: false
 * });
 *
 * // Wait for job template job to start running
 * const job = await waitForJobStatus({
 *   page,
 *   jobType: 'jobs',
 *   jobId: 789,
 *   desiredStatus: 'running',
 *   timeout: 30000
 * });
 * ```
 *
 * @param options - Configuration options for waiting
 * @param page - Playwright page object
 * @returns Promise that resolves with the job object when desired status is reached
 * @throws Error if timeout is reached or job fails unexpectedly
 */
export async function waitForJobStatus<T extends JobStatusResponse = JobStatusResponse>(
  options: WaitForJobStatusOptions,
  page: Page
): Promise<T> {
  const {
    jobType,
    jobId,
    desiredStatus,
    timeout = 120000,
    pollingInterval = 2000,
    throwOnFailure = true,
  } = options;

  const desiredStatuses = Array.isArray(desiredStatus) ? desiredStatus : [desiredStatus];
  const startTime = Date.now();
  const jobIdString = jobId.toString();

  while (Date.now() - startTime < timeout) {
    const response = await awxAPI.get<T>(page, `/${jobType}/${jobIdString}/`);

    if (!response) {
      throw new Error(`Failed to fetch status for ${jobType}/${jobIdString}`);
    }

    const currentStatus = response.status;

    // Check if desired status is reached
    if (desiredStatuses.includes(currentStatus)) {
      return response;
    }

    // Check if job failed unexpectedly
    if (
      throwOnFailure &&
      ['failed', 'error', 'canceled'].includes(currentStatus) &&
      !desiredStatuses.includes(currentStatus)
    ) {
      throw new Error(
        `${jobType}/${jobIdString} reached unexpected status '${currentStatus}' while waiting for '${desiredStatuses.join(' or ')}'`
      );
    }

    // Wait before polling again
    await page.waitForTimeout(pollingInterval);
  }

  throw new Error(
    `${jobType}/${jobIdString} did not reach desired status '${desiredStatuses.join(' or ')}' within ${timeout}ms`
  );
}
