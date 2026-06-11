import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  filtersToSearchObj,
  IFilterState,
  IToolbarFilter,
  paramsToSearchObj,
  QueryParams,
  usePageAlertToaster,
} from '../../../../../framework';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { svgToPng } from '../utils/svgToPng';
import { downloadBlobFile } from '../../../../../framework/utils/download-file';

interface PdfRequestBody {
  job_chart: string | null;
  host_chart: string | null;
}

/**
 * Returns a stable async callback that captures the current chart SVGs as PNGs,
 * POSTs them to the PDF endpoint and triggers a file download.
 */
export function useExportPdf(
  toolbarFilters: IToolbarFilter[],
  filterState: IFilterState,
  queryParams: QueryParams
): () => Promise<void> {
  const postRequest = usePostRequest<PdfRequestBody, Blob>();
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();

  const downloadPdf = useCallback(
    async (url: string) => {
      const jobsChartSvg =
        document.querySelector('#job-chart-card .pf-v6-c-chart')?.querySelector('svg') ?? null;
      const hostChartSvg =
        document.querySelector('#host-chart-card .pf-v6-c-chart')?.querySelector('svg') ?? null;

      try {
        const [jobsChartPng, hostChartPng] = await Promise.all([
          svgToPng(jobsChartSvg),
          svgToPng(hostChartSvg),
        ]);
        const blob = await postRequest(url, { job_chart: jobsChartPng, host_chart: hostChartPng });
        downloadBlobFile('AAP_Automation_Dashboard_Report', 'pdf', blob);
      } catch (err) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to export PDF.'),
          children: err instanceof Error ? err.message : undefined,
          timeout: 5000,
        });
      }
    },
    [alertToaster, postRequest, t]
  );

  return useCallback(async () => {
    const params = new URLSearchParams([
      ...paramsToSearchObj(queryParams),
      ...filtersToSearchObj(toolbarFilters, filterState),
    ]);
    const url = metricsAPI`/dashboard_reports/report/pdf/?${params.toString()}`;
    await downloadPdf(url);
  }, [toolbarFilters, filterState, queryParams, downloadPdf]);
}
