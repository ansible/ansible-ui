import { useCallback, useEffect, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useFetcher } from '@ansible/common-ui/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { metricsAPI } from '../../../common/api/metrics-utils';

interface TemplateRecord {
  id: number;
  name: string;
}

export interface UseJobTemplateIdsResult {
  templateIds: [string, string][] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const PAGE_SIZE = 200;

/**
 * Fetches all job template IDs from the /dashboard_reports/templates/ endpoint,
 * paginating through all pages.
 *
 * This endpoint queries the AWX DB's main_jobtemplate table via an INNER JOIN,
 * so system_job_templates (Cleanup Activity Stream, etc.) are excluded.
 *
 * Returns template IDs as URLSearchParams entries (['template', '<id>'][])
 * suitable for injection into API query strings to exclude system jobs from
 * report results. Returns `undefined` while loading or on error so callers
 * can gate fetches until data is ready.
 *
 * NOTE: Injecting all template IDs as query params may exceed URL length
 * limits (8-20 KB) for very large deployments (thousands of templates).
 * This is a known limitation of the frontend workaround, pending a
 * backend-side fix (e.g. an `exclude_system_jobs` query parameter on
 * metrics-service — see AAP-92027 for the tracking ticket).
 */
export function useJobTemplateIds(): UseJobTemplateIdsResult {
  const baseUrl = metricsAPI`/dashboard_reports/templates/`;
  const fetcher = useFetcher();

  const getKey = useCallback(
    (pageIndex: number, previousPageData: AwxItemsResponse<TemplateRecord> | null) => {
      if (previousPageData && !previousPageData.next) return null;
      return `${baseUrl}?page=${pageIndex + 1}&page_size=${PAGE_SIZE}`;
    },
    [baseUrl]
  );

  const response = useSWRInfinite<AwxItemsResponse<TemplateRecord>>(getKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
  const { data, isLoading, size, setSize } = response;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const error: Error | undefined = response.error;

  useEffect(() => {
    if (data && data.length === size && data[data.length - 1]?.next) {
      void setSize(size + 1);
    }
  }, [data, size, setSize]);

  const isStillPaginating = !!data?.at(-1)?.next;

  const templateIds = useMemo(() => {
    if (isLoading || error || data === undefined || isStillPaginating) return undefined;
    const allResults = data.flatMap((page) => page.results ?? []);
    if (!allResults.length) return [];
    return allResults.map((t): [string, string] => ['template', t.id.toString()]);
  }, [data, isLoading, error, isStillPaginating]);

  return { templateIds, isLoading: isLoading || isStillPaginating, error };
}
