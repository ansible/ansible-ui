import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { downloadBlobFile } from '@ansible/ansible-ui-framework/utils/download-file';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { HostMetric } from '../../../interfaces/HostMetric';
import { hostMetricsToCsv, withHostMetricsPagination } from './hostMetricsCsv';

const PAGE_SIZE = 200;

/**
 * Fetches all host metric pages for the current list URL (filters preserved)
 * and triggers a CSV download in the browser.
 */
export async function fetchAllHostMetrics(
  listUrl: string,
  signal?: AbortSignal
): Promise<HostMetric[]> {
  const hosts: HostMetric[] = [];

  const fetchPage = async (page: number): Promise<void> => {
    const url = withHostMetricsPagination(listUrl, page, PAGE_SIZE);
    const response = await requestGet<AwxItemsResponse<HostMetric>>(url, signal);
    if (Array.isArray(response.results)) {
      hosts.push(...response.results);
    }
    if (response.next) {
      await fetchPage(page + 1);
    }
  };

  await fetchPage(1);
  return hosts;
}

export function useDownloadHostMetrics(listUrl: string) {
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);

  const downloadHostMetrics = useCallback(async () => {
    if (isDownloadingRef.current) {
      return;
    }
    isDownloadingRef.current = true;
    setIsDownloading(true);
    try {
      const hosts = await fetchAllHostMetrics(listUrl);
      const csv = hostMetricsToCsv(hosts);
      const endDate = new Date().toISOString().split('T')[0];
      downloadBlobFile(
        `host-metrics-${endDate}`,
        'csv',
        new Blob([csv], { type: 'text/csv;charset=utf-8' })
      );
    } catch (err) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to download host metrics.'),
        children: err instanceof Error ? err.message : t('An unknown error occurred.'),
        timeout: 5000,
      });
    } finally {
      isDownloadingRef.current = false;
      setIsDownloading(false);
    }
  }, [listUrl, alertToaster, t]);

  return { downloadHostMetrics, isDownloading };
}
