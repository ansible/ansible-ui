import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../Data';
import { HostMetric } from '../../../interfaces/HostMetric';
import { useHostMetricsColumns } from './useHostMetricsColumns';

export function useDeleteHostMetrics(onComplete: (host: HostMetric[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useHostMetricsColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<HostMetric>();
  const deleteHostMetrics = (host: HostMetric[]) => {
    bulkAction({
      title: t('Soft delete hostnames', { count: host.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} hostnames.', {
        count: host.length,
      }),
      actionButtonText: t('Delete hostnames', { count: host.length }),
      items: host.sort((l, r) => compareStrings(l.hostname, r.hostname)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (host: HostMetric) => requestDelete(`/api/v2/host_metrics/${host.id}/`),
    });
  };
  return deleteHostMetrics;
}
