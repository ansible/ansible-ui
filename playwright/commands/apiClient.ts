import { APIResponse, Page, expect } from '@playwright/test';
import { platformUI } from './login';

/**
 * Generic API client for making authenticated requests in Playwright tests.
 * Uses page.request to automatically share authentication cookies with the browser session.
 */

// Origin for CSRF (without trailing slash)
const origin = platformUI.replace(/\/$/, '');

interface RequestOptions {
  expectStatus?: number;
  headers?: Record<string, string>;
}

interface GetRequestOptions extends RequestOptions {
  params?: Record<string, string | number | boolean | string[]>;
}

async function getCSRFToken(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  const csrfCookie = cookies.find((cookie) => cookie.name === 'csrftoken');

  if (!csrfCookie?.value) {
    throw new Error(
      'CSRF token not found in cookies. Make sure the user is logged in before making API requests.'
    );
  }

  return csrfCookie.value;
}

function constructURL(path: string): string {
  if (typeof path !== 'string') {
    throw new TypeError(`Invalid path: expected string, got ${typeof path}`);
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (!platformUI) {
    throw new Error('platformUI is not configured. Check login.ts configuration.');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseURL = platformUI.endsWith('/') ? platformUI.slice(0, -1) : platformUI;

  return baseURL + normalizedPath;
}

function buildURLWithParams(
  baseURL: string,
  params?: Record<string, string | number | boolean | string[]>
): string {
  if (!params || Object.keys(params).length === 0) {
    return baseURL;
  }

  const url = new URL(baseURL);

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        url.searchParams.append(key, String(item));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  return url.toString();
}

async function parseResponse<T>(response: APIResponse): Promise<T | null> {
  const headers = response.headers();
  const contentType = headers['content-type'] || '';

  if (response.status() === 204 || !contentType) {
    return null as T;
  }

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new TypeError(
        `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  const text = await response.text();
  return text as T;
}

export async function post<T = unknown>(
  page: Page,
  path: string,
  data?: unknown,
  options: RequestOptions = {}
): Promise<T | null> {
  const { expectStatus = 201, headers = {} } = options;

  try {
    const csrfToken = await getCSRFToken(page);
    const url = constructURL(path);

    const response = await page.request.post(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        Referer: platformUI,
        'X-CSRFToken': csrfToken,
        ...headers,
      },
    });

    if (response.status() !== expectStatus) {
      const responseBody = await response.text();
      throw new Error(
        `Expected status ${expectStatus} but got ${response.status()}. Response: ${responseBody}`
      );
    }

    const responseBody = await parseResponse<T>(response);

    return responseBody;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`POST request failed for ${path}: ${errorMessage}`);
  }
}

export async function get<T = unknown>(
  page: Page,
  path: string,
  options: GetRequestOptions = {}
): Promise<T | null> {
  const { expectStatus = 200, params = {}, headers = {} } = options;

  try {
    const baseURL = constructURL(path);
    const url = buildURLWithParams(baseURL, params);

    const response = await page.request.get(url, {
      headers,
    });

    expect(response.status()).toBe(expectStatus);
    const responseBody = await parseResponse<T>(response);

    return responseBody;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`GET request failed for ${path}: ${errorMessage}`);
  }
}

export async function put<T = unknown>(
  page: Page,
  path: string,
  data?: unknown,
  options: RequestOptions = {}
): Promise<T | null> {
  const { expectStatus = 200, headers = {} } = options;

  try {
    const csrfToken = await getCSRFToken(page);
    const url = constructURL(path);

    const response = await page.request.put(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        Referer: platformUI,
        'X-CSRFToken': csrfToken,
        ...headers,
      },
    });

    expect(response.status()).toBe(expectStatus);
    const responseBody = await parseResponse<T>(response);

    return responseBody;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`PUT request failed for ${path}: ${errorMessage}`);
  }
}

export async function patch<T = unknown>(
  page: Page,
  path: string,
  data?: unknown,
  options: RequestOptions = {}
): Promise<T | null> {
  const { expectStatus = 200, headers = {} } = options;

  try {
    const csrfToken = await getCSRFToken(page);
    const url = constructURL(path);

    const response = await page.request.patch(url, {
      data,
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        Referer: platformUI,
        'X-CSRFToken': csrfToken,
        ...headers,
      },
    });

    expect(response.status()).toBe(expectStatus);
    const responseBody = await parseResponse<T>(response);

    return responseBody;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`PATCH request failed for ${path}: ${errorMessage}`);
  }
}

export async function deleteFn<T = unknown>(
  page: Page,
  path: string,
  options: RequestOptions = {}
): Promise<T | null> {
  const { expectStatus = 204, headers = {} } = options;

  try {
    const csrfToken = await getCSRFToken(page);
    const url = constructURL(path);

    const response = await page.request.delete(url, {
      headers: {
        Origin: origin,
        Referer: platformUI,
        'X-CSRFToken': csrfToken,
        ...headers,
      },
    });

    expect(response.status()).toBe(expectStatus);
    const responseBody = await parseResponse<T>(response);

    return responseBody;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`DELETE request failed for ${path}: ${errorMessage}`);
  }
}

/**
 * Exported API client with all HTTP methods
 *
 * @example
 * ```typescript
 * import { apiClient } from '@ansible/playwright/commands/apiClient';
 *
 * const workflow = await apiClient.post(page, '/api/controller/v2/workflow_job_templates/', {
 *   name: 'Test Workflow',
 * });
 *
 * await apiClient.delete(page, `/api/controller/v2/workflow_job_templates/${workflow.id}/`);
 * ```
 */
export const apiClient = {
  post,
  get,
  put,
  patch,
  delete: deleteFn,
};

/**
 * Create a scoped API client for a specific API prefix
 * Useful for creating service-specific clients (AWX, EDA, Hub, etc.)
 *
 * @example
 * ```typescript
 * const awxAPI = createScopedClient('/api/controller/v2');
 * const workflow = await awxAPI.post(page, '/workflow_job_templates/', { name: 'Test' });
 * await awxAPI.delete(page, `/workflow_job_templates/${workflow.id}/`);
 * ```
 */
export function createScopedClient(apiPrefix: string) {
  const normalizedPrefix = apiPrefix.endsWith('/') ? apiPrefix : `${apiPrefix}/`;

  return {
    post: <T = unknown>(
      page: Page,
      path: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<T | null> => {
      const fullPath = path.startsWith('/')
        ? normalizedPrefix + path.slice(1)
        : normalizedPrefix + path;
      return post<T>(page, fullPath, data, options);
    },

    get: <T = unknown>(
      page: Page,
      path: string,
      options?: GetRequestOptions
    ): Promise<T | null> => {
      const fullPath = path.startsWith('/')
        ? normalizedPrefix + path.slice(1)
        : normalizedPrefix + path;
      return get<T>(page, fullPath, options);
    },

    put: <T = unknown>(
      page: Page,
      path: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<T | null> => {
      const fullPath = path.startsWith('/')
        ? normalizedPrefix + path.slice(1)
        : normalizedPrefix + path;
      return put<T>(page, fullPath, data, options);
    },

    patch: <T = unknown>(
      page: Page,
      path: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<T | null> => {
      const fullPath = path.startsWith('/')
        ? normalizedPrefix + path.slice(1)
        : normalizedPrefix + path;
      return patch<T>(page, fullPath, data, options);
    },

    delete: <T = unknown>(
      page: Page,
      path: string,
      options?: RequestOptions
    ): Promise<T | null> => {
      const fullPath = path.startsWith('/')
        ? normalizedPrefix + path.slice(1)
        : normalizedPrefix + path;
      return deleteFn<T>(page, fullPath, options);
    },
  };
}

export const awxAPI = createScopedClient('/api/controller/v2');
export const edaAPI = createScopedClient('/api/eda/v1');
export const hubAPI = createScopedClient('/api/galaxy');
export const pulpAPI = createScopedClient('/api/galaxy/pulp/api/v3');
export const gatewayAPI = createScopedClient('/api/gateway/v1');
export const lightspeedAPI = createScopedClient('/api/lightspeed/v1');

// Export utilities for use in fixtures
export { constructURL, getCSRFToken, origin };
