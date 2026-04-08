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
import { requestCommon } from '../../../../common/crud/requestCommon';
import { downloadCvsFile } from '../../../../../framework/utils/download-file';

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
): () => Promise<void> {
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const downloadCsv = useCallback(
    async (url: string) => {
      let errorMsg: string | undefined = undefined;
      let error = false;
      try {
        const response: Response = await requestCommon({
          url,
          method: 'GET',
        });
        if (response.ok) {
          const content = await response.text();
          downloadCvsFile('AAP_Automation_Dashboard_Report', [content]);
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

  return useCallback(async () => {
    const params = new URLSearchParams([
      ...paramsToSearchObj(queryParams),
      ...filtersToSearchObj(toolbarFilters, filterState),
    ]);
    const url = metricsAPI`/dashboard_reports/report/csv/?${params.toString()}`;
    await downloadCsv(url);
  }, [toolbarFilters, filterState, queryParams, downloadCsv]);
}
