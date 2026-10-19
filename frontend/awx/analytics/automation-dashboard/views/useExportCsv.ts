import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IFilterState,
  IToolbarFilter,
  paramsToSearchObj,
  QueryParams,
  usePageAlertToaster,
} from '../../../../../framework';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { requestCommon } from '../../../../common/crud/requestCommon';
import { downloadBlobFile } from '../../../../../framework/utils/download-file';
import { ReportType } from '../types';
import { filtersToSearchObj } from '../utils/queryString';

/**
 * Returns a stable async callback that fetches the CSV export for the current
 * filter state and triggers a programmatic file download.
 *
 * All failure modes (network errors and non-2xx responses) are handled
 * in-app via an error toast so the app is never navigated away from.
 */
export function useExportCsv(
  toolbarFilters: IToolbarFilter[],
  filterState: IFilterState,
  queryParams: QueryParams
): (reportType: ReportType) => Promise<void> {
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const downloadCsv = useCallback(
    async (url: string, reportType: ReportType) => {
      let errorMsg: string | undefined = undefined;
      let error = false;
      try {
        const response: Response = await requestCommon({
          url,
          method: 'GET',
        });
        if (response.ok) {
          const blob = await response.blob();
          const disposition = response.headers.get('Content-Disposition');
          // RFC 5987 takes priority per RFC 6266: charset'language'encoded-value
          const rfc5987 = disposition?.match(/filename\*=[a-z0-9-]+'[a-z-]*'([^;\n]+)/i)?.[1];
          // Plain filename fallback
          const plain = disposition?.match(/\bfilename="?([^";\n]+)"?/i)?.[1];
          const endDate = new Date().toISOString().split('T')[0];
          let filename: string;
          if (rfc5987) {
            filename = decodeURIComponent(rfc5987.trim()).replace(/\.csv$/i, '');
          } else if (plain) {
            filename = plain.trim().replace(/\.csv$/i, '');
          } else {
            filename = `automation-dashboard-${reportType}-${endDate}`;
          }
          downloadBlobFile(filename, 'csv', blob);
        } else {
          error = true;
          errorMsg = `${response.status} ${response.statusText}`;
        }
      } catch (err) {
        error = true;
        errorMsg = err instanceof Error ? err.message : t('An unknown error occurred.');
      }
      if (error) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to export CSV.'),
          children: errorMsg,
          timeout: 5000,
        });
      }
    },
    [alertToaster, t]
  );

  return useCallback(
    async (reportType: ReportType) => {
      const params = new URLSearchParams([
        ...paramsToSearchObj(queryParams),
        ...filtersToSearchObj(toolbarFilters, filterState),
        ['report_type', reportType],
        ['export_format', 'csv'],
      ]);
      const url = metricsAPI`/dashboard_reports/report/export/?${params.toString()}`;
      await downloadCsv(url, reportType);
    },
    [toolbarFilters, filterState, queryParams, downloadCsv]
  );
}
