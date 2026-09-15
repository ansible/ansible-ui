import { useMemo } from 'react';
import useSWR from 'swr';
import { useFetcher } from '@ansible/common-ui/crud/Data';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { metricsAPI } from '../../../common/api/metrics-utils';

interface TemplateRecord {
  id: number;
  name: string;
}

/**
 * Fetches all job template IDs from the /dashboard_reports/templates/ endpoint.
 *
 * This endpoint queries the AWX DB's main_jobtemplate table via an INNER JOIN,
 * so system_job_templates (Cleanup Activity Stream, etc.) are excluded.
 *
 * Returns template IDs as URLSearchParams entries (['template', '<id>'][])
 * suitable for injection into API query strings to exclude system jobs from
 * report results. Returns an empty array while loading or on error.
 */
export function useJobTemplateIds(): [string, string][] {
  const url = metricsAPI`/dashboard_reports/templates/?page_size=1000`;
  const fetcher = useFetcher();
  const { data } = useSWR<AwxItemsResponse<TemplateRecord>>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return useMemo(() => {
    if (!data?.results?.length) return [];
    return data.results.map((t): [string, string] => ['template', t.id.toString()]);
  }, [data]);
}
