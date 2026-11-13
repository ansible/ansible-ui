import { QueryParams } from '@ansible/ansible-ui-framework';

const DEEP_LINK_QUERY_KEYS = [
  'status',
  'type',
  'organization',
  'unified_job_template',
  'finished__gte',
  'finished__lte',
  'labels__id',
] as const;

/**
 * Returns the whitelisted Controller query parameters carried by dashboard deep links.
 * Passing them directly ensures the initial request is filtered before dynamic toolbar
 * metadata has loaded; known toolbar filters may also mirror these values in the URL.
 */
export function getJobsDeepLinkQueryParams(search: string): QueryParams {
  const searchParams = new URLSearchParams(search);
  const queryParams: QueryParams = {};

  for (const key of DEEP_LINK_QUERY_KEYS) {
    const values = searchParams.getAll(key);
    if (values.length > 0) queryParams[key] = values;
  }

  return queryParams;
}
