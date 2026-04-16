import { ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
import { requestDelete } from '@ansible/common-ui/crud/Data';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { IDashboardFilterSet } from '../types';

export function useRemoveToolbarFilterSet(onComplete: (filterSets: IDashboardFilterSet[]) => void) {
  const { t } = useTranslation();
  const bulkAction = useAwxBulkConfirmation<IDashboardFilterSet>();

  const reportNameColumn = useMemo<ITableColumn<IDashboardFilterSet>>(
    () => ({
      header: t('Name'),
      cell: (item: IDashboardFilterSet) => {
        const name = item.name;
        return <TextCell text={name} iconSize="sm" />;
      },
    }),
    [t]
  );

  const confirmationColumns = useMemo<ITableColumn<IDashboardFilterSet>[]>(
    () => [reportNameColumn],
    [reportNameColumn]
  );

  return useCallback(
    (filterSet: IDashboardFilterSet) => {
      bulkAction({
        actionFn: (item: IDashboardFilterSet, signal: AbortSignal) =>
          requestDelete(metricsAPI`/dashboard_reports/filter_sets/${item.id.toString()}/`, signal),
        actionButtonText: t('Delete report'),
        actionColumns: [],
        confirmationColumns: confirmationColumns,
        title: t('Permanently delete report?'),
        confirmText: t('Yes, delete 1 report.'),
        items: [filterSet],
        keyFn: (item) => item.id,
        isDanger: true,
        onComplete,
      });
    },
    [bulkAction, t, confirmationColumns, onComplete]
  );
}
