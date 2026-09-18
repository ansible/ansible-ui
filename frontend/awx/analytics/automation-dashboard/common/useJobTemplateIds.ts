import { useMemo } from 'react';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
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
 * backend-side fix (e.g. an `exclude_system_jobs` query parameter).
 */
export function useJobTemplateIds(): UseJobTemplateIdsResult {
  const url = metricsAPI`/dashboard_reports/templates/`;
  const { results, isLoading, error } = useAwxGetAllPages<TemplateRecord>(url);

  const templateIds = useMemo(() => {
    if (isLoading || results === undefined) return undefined;
    if (!results.length) return [];
    return results.map((t): [string, string] => ['template', t.id.toString()]);
  }, [results, isLoading]);

  return { templateIds, isLoading, error };
}
