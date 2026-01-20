import { Page } from '@playwright/test';
import { constructURL } from '../../commands/apiClient';

/** Hub task state */
export interface HubTask {
  state: 'waiting' | 'running' | 'completed' | 'failed' | 'canceled' | 'skipped';
  error?: {
    description?: string;
  };
  pulp_href?: string;
  name?: string;
  created_resources?: string[];
}

/** Set of task states that indicate failure */
const FAILING_STATES = new Set(['failed', 'canceled', 'skipped']);

/** Default task polling timeout (60 seconds) */
const DEFAULT_TASK_TIMEOUT = 60000;

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for a Hub task to complete with exponential backoff polling.
 *
 * @param page - Playwright page object
 * @param taskUrl - The task URL returned from an API call
 * @param options - Configuration options
 * @returns The completed task object
 */
export async function waitForHubTask(
  page: Page,
  taskUrl: string,
  options: { timeout?: number; initialDelay?: number; multiplier?: number } = {}
): Promise<HubTask> {
  const { timeout = DEFAULT_TASK_TIMEOUT, initialDelay = 200, multiplier = 1.5 } = options;

  // Extract task ID from URL (e.g., "/api/galaxy/pulp/api/v3/tasks/abc-123/" -> "abc-123")
  const urlParts = taskUrl.split('/').filter(Boolean);
  const taskId = urlParts.at(-1);
  if (!taskId) {
    throw new Error(`Invalid task URL: ${taskUrl}`);
  }

  const startTime = Date.now();
  let currentDelay = initialDelay;
  let attempt = 0;

  while (Date.now() - startTime < timeout) {
    await sleep(currentDelay);
    attempt++;

    const response = await page.request.get(
      constructURL(`/api/galaxy/pulp/api/v3/tasks/${taskId}/`)
    );

    if (response.status() === 404) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const task = (await response.json()) as HubTask;

    if (task.state === 'completed') {
      return task;
    }

    if (FAILING_STATES.has(task.state)) {
      const errorMsg = task.error?.description ?? `Task ${task.state} without error message`;
      throw new Error(errorMsg);
    }

    currentDelay = Math.round(currentDelay * multiplier);
  }

  const elapsed = Date.now() - startTime;
  throw new Error(`Task timed out after ${elapsed}ms (${attempt} attempts): ${taskId}`);
}
