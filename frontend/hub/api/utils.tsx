import { HTTPError } from 'ky';
import { activeAutomationServer } from '../../automation-servers/AutomationServersProvider';
import { Task } from '../tasks/Task';
import { deleteRequest, patchRequest, getRequest } from './request';
import { TaskResponse } from '../tasks/Task';
import { AutomationServerType } from '../../automation-servers/AutomationServer';

function apiTag(strings: TemplateStringsArray, ...values: string[]) {
  if (strings[0]?.[0] !== '/') {
    throw new Error('Invalid URL');
  }

  let url = '';
  strings.forEach((fragment, index) => {
    url += fragment;
    if (index !== strings.length - 1) {
      url += encodeURIComponent(`${values.shift() ?? ''}`);
    }
  });

  return url;
}

export function hubAPI(strings: TemplateStringsArray, ...values: string[]) {
  let base = process.env.HUB_API_BASE_PATH;
  if (!base) {
    if (activeAutomationServer?.type === AutomationServerType.Galaxy) {
      base = '/api/galaxy';
    } else {
      base = '/api/automation-hub';
    }
  }
  return base + apiTag(strings, ...values);
}

export function pulpAPI(strings: TemplateStringsArray, ...values: string[]) {
  let base = process.env.HUB_API_BASE_PATH;
  if (!base) {
    if (activeAutomationServer?.type === AutomationServerType.Galaxy) {
      base = '/api/galaxy';
    } else {
      base = '/api/automation-hub';
    }
  }
  return base + '/pulp/api/v3' + apiTag(strings, ...values);
}

export type QueryParams = {
  [key: string]: string;
};

export function getQueryString(queryParams: QueryParams) {
  return Object.entries(queryParams)
    .map(([key, value = '']) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

const UUIDRegEx = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i;

export function parsePulpIDFromURL(url: string): string | null {
  for (const section of url.split('/')) {
    if (section.match(UUIDRegEx)) {
      return section;
    }
  }

  return null;
}

// pulp next links currently include full url - with the wrong server
// "http://localhost:5001/api/page/next?what#ever" -> "/api/page/next?what#ever"
// also has to handle hub links (starting with /api/) and undefined
export function serverlessURL(url?: string) {
  if (!url || url.startsWith('/')) {
    return url;
  }

  const { pathname, search, hash } = new URL(url);
  return `${pathname}${search}${hash}`;
}

export function pulpIdKeyFn(item: { pulp_id: string }) {
  return item.pulp_id;
}

export function pulpHrefKeyFn(item: { pulp_href: string }) {
  return item.pulp_href;
}

export function nameKeyFn(item: { name: string }) {
  return item.name;
}

export function idKeyFn(item: { id: number | string }) {
  return item.id;
}

export function collectionKeyFn(item: {
  collection_version: { pulp_href: string };
  repository: { name: string };
}) {
  return item.collection_version.pulp_href + '_' + item.repository.name;
}

export function appendTrailingSlash(url: string) {
  return url.endsWith('/') ? url : url + '/';
}

export async function requestDeleteHub<T extends object>(url: string, signal?: AbortSignal) {
  try {
    const { response, statusCode } = await deleteRequest<T>(url, signal);
    if (statusCode === 202) {
      const taskResponse = response as TaskResponse;
      const taskHref = parsePulpIDFromURL(taskResponse.task);
      if (taskHref) {
        await waitForTask(taskHref, signal);
      }
    }
  } catch (error) {
    throw new Error('Error deleting item');
  }
}

export async function requestPatchHub<T extends object, RequestBody = unknown>(
  url: string,
  data: RequestBody,
  signal?: AbortSignal
) {
  try {
    const { response, statusCode } = await patchRequest<T>(url, data, signal);
    if (statusCode === 202) {
      const taskResponse = response as TaskResponse;
      const taskHref = parsePulpIDFromURL(taskResponse.task);
      if (taskHref) {
        await waitForTask(taskHref, signal);
      }
    }
  } catch (error) {
    throw new Error('Error updating item');
  }
}

/**
 * Waits for a task to complete, given its href.
 *
 * Certain API actions return a response with a status code 202, containing a task reference
 * like `{ task: task_href }`. This function is used to wait for the referenced task to complete
 * successfully or fail with an error.
 *
 * @param {string | null} taskHref - The href of the task to wait for.
 * @param {AbortSignal} [signal] - An optional AbortSignal for aborting the waiting.
 * @param {number} [minDelay=5] - The initial delay between retries, in milliseconds.
 * @param {number} [maxDelay=1000] - The maximum delay between retries, in milliseconds.
 * @param {number} [retries=20] - The maximum number of retries.
 *
 * @throws {Error} Throws an error if the task href is invalid or if the task did not finish within the specified retries.
 * @throws {Error} Throws an error with task error description if the task fails with an error.
 * @throws {Error} Throws an error if the task is not found (status code 404).
 */
export async function waitForTask(
  taskHref: string | null,
  signal?: AbortSignal,
  minDelay = 5,
  maxDelay = 1000,
  retries = 20
) {
  if (taskHref === null) {
    throw new Error('Invalid task href');
  }
  const failingStatus = ['skipped', 'failed', 'canceled'];
  const successStatus = ['completed'];

  let currentDelay = minDelay;
  try {
    while (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      const { response } = await getRequest<Task>(pulpAPI`/tasks/${taskHref}`, signal);
      const task = response as Task;

      if (task && successStatus.includes(task.state)) {
        break;
      }

      if (task && failingStatus.includes(task.state)) {
        if (task?.error?.description) {
          throw new Error(task?.error.description);
        } else {
          throw new Error('Task failed without error message.');
        }
      }
      currentDelay = Math.min(currentDelay * 2, maxDelay);
      retries--;
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      if (error.response.status === 404) {
        throw new Error(`Task not found`);
      }
    } else {
      throw error;
    }
  }
  if (retries === 0) {
    throw new Error(`Task did not finish within the specified retries`);
  }
}
