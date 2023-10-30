import { RequestError } from '../../common/crud/RequestError';
import { Task, TaskResponse } from '../tasks/Task';
import {
  deleteHubRequest,
  getHubRequest,
  patchHubRequest,
  postHubRequest,
  putHubRequest,
} from './request';
import { useTranslation } from 'react-i18next';
import { requestGet } from '../../common/crud/Data';
import { AnsibleAnsibleRepositoryResponse as Repository } from '../api-schemas/generated/AnsibleAnsibleRepositoryResponse';
import { AnsibleAnsibleDistributionResponse as Distribution } from '../api-schemas/generated/AnsibleAnsibleDistributionResponse';
import { useEffect, useState } from 'react';
import { isRequestError } from '../../common/crud/RequestError';

function getBaseAPIPath() {
  return process.env.HUB_API_PREFIX;
}

type Results = { data: { results: Repository[] | Distribution[] } };
export function useRepositoryBasePath(name: string | undefined, pulp_href?: string | undefined) {
  console.log(name, pulp_href, 'useRepositoryBasePath');
  const { t } = useTranslation();

  const [basePath, setBasePath] = useState<string | null>('blahahhh');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchRepositoryBasePath = async () => {
      try {
        let repository: Repository | undefined | { name: string; pulp_href: string };

        if (pulp_href) {
          repository = { name, pulp_href };
        } else {
          const repositoryResponse = await requestGet<Results>(
            pulpAPI`/repositories/ansible/ansible/?name=${name}&limit=1`
          );
          repository = firstResult(repositoryResponse) as Repository;
        }
        if (!repository) {
          throw new Error(t`Failed to find repository ${name}`);
        }
        const distributionResponse = await requestGet<Results>(
          pulpAPI`/distributions/ansible/ansible/?name=${name}&limit=1`
        );
        let distribution: Distribution = firstResult(distributionResponse) as Distribution;
        if (distribution && distribution.repository === repository.pulp_href) {
          setBasePath(distribution.base_path);
        } else {
          const newDistResponse = await requestGet<Results>(
            pulpAPI`/distributions/ansible/ansible/?repository=${repository.pulp_href}&ordering=pulp_created&limit=1`
          );
          distribution = firstResult(newDistResponse) as Distribution;
          if (!distribution) {
            throw new Error(t`Failed to find a distribution for repository ${name}`);
          }
          setBasePath(distribution.base_path);
        }
      } catch (error) {
        if (isRequestError(error)) {
          setError(error.message);
        } else {
          setError(t`Failed to find repository base path`);
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchRepositoryBasePath();
  }, []);

  const x = { basePath, loading, error };
  console.log(x, 'useRepositoryBasePath result');
  return x;
}

function firstResult(results: Results) {
  return results.results[0];
}

export function apiTag(strings: TemplateStringsArray, ...values: string[]) {
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
  const base = getBaseAPIPath();
  return base + apiTag(strings, ...values);
}

export function pulpAPI(strings: TemplateStringsArray, ...values: string[]) {
  const base = getBaseAPIPath();
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

export function collectionKeyFn(item: {
  collection_version?: { pulp_href: string; version?: string };
  repository?: { name: string };
}) {
  return (
    item.collection_version?.pulp_href +
    '_' +
    item.repository?.name +
    '_' +
    item.collection_version?.version
  );
}

export function appendTrailingSlash(url: string) {
  return url.endsWith('/') ? url : url + '/';
}

export async function hubAPIDelete<T extends object>(url: string, signal?: AbortSignal) {
  try {
    const { response, statusCode } = await deleteHubRequest<T>(url, signal);
    if (statusCode === 202) {
      await parseTaskResponse(response as TaskResponse, signal);
    }
  } catch (error) {
    handleError(error, 'Error deleting item');
  }
}

export async function hubAPIPatch<T extends object, RequestBody = unknown>(
  url: string,
  data: RequestBody,
  signal?: AbortSignal
) {
  try {
    const { response, statusCode } = await patchHubRequest<T>(url, data, signal);
    if (statusCode === 202) {
      await parseTaskResponse(response as TaskResponse, signal);
    }
  } catch (error) {
    handleError(error, 'Error updating item');
  }
}

export async function hubAPIPut<T extends object, RequestBody = unknown>(
  url: string,
  data: RequestBody,
  signal?: AbortSignal
) {
  try {
    const { response, statusCode } = await putHubRequest<T>(url, data, signal);
    if (statusCode === 202) {
      await parseTaskResponse(response as TaskResponse, signal);
    }
  } catch (error) {
    handleError(error, 'Error updating item');
  }
}

export async function hubAPIPost<T extends object, RequestBody = unknown>(
  url: string,
  data: RequestBody,
  signal?: AbortSignal
) {
  try {
    const { response, statusCode } = await postHubRequest<T>(url, data, signal);
    if (statusCode === 202) {
      await parseTaskResponse(response as TaskResponse, signal);
    }
  } catch (error) {
    handleError(error, 'Error creating item');
  }
}

function handleError(error: unknown, defaultMessage: string) {
  if (error instanceof RequestError) {
    throw error;
  } else {
    throw new Error(defaultMessage);
  }
}

export async function parseTaskResponse(response: TaskResponse | undefined, signal?: AbortSignal) {
  if (response?.task) {
    const taskHref = parsePulpIDFromURL(response.task);
    if (taskHref) {
      await waitForTask(taskHref, signal);
    }
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
 * @param {number} [minDelay=200] - The initial delay between retries, in milliseconds.
 * @param {number} [retries=15] - The number of retries before failing.
 * @param {number} [multiplier=1.5] - The multiplier for increasing the delay between retries.
 *
 * @throws {Error} Throws an error if the task href is invalid or if the task did not finish within the specified retries.
 * @throws {Error} Throws an error with task error description if the task fails with an error.
 * @throws {Error} Throws an error if the task is not found (status code 404).
 */
export async function waitForTask(
  taskHref: string | null,
  signal?: AbortSignal,
  minDelay = 200,
  multiplier = 1.5,
  retries = 15
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
      const { response } = await getHubRequest<Task>(pulpAPI`/tasks/${taskHref}`, signal);
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
      currentDelay = Math.round(currentDelay * multiplier);
      retries--;
    }
  } catch (error) {
    if (error instanceof RequestError) {
      if (error.statusCode === 404) {
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
