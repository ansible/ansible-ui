import { compareStrings, ITableColumn, TextCell } from '@ansible/ansible-ui-framework';
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
    (filterSets: IDashboardFilterSet | IDashboardFilterSet[]) => {
      const items = Array.isArray(filterSets) ? filterSets : [filterSets];
      const sortedItems = [...items].sort((l, r) => compareStrings(l.name, r.name));

      bulkAction({
        title: t('Permanently delete reports', { count: sortedItems.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} reports.', {
          count: sortedItems.length,
        }),
        actionButtonText: t('Delete reports', { count: sortedItems.length }),
        items: sortedItems,
        keyFn: (item) => item.id,
        isDanger: true,
        confirmationColumns,
        actionColumns: confirmationColumns,
        onComplete,
        actionFn: (item: IDashboardFilterSet, signal: AbortSignal) =>
          requestDelete(metricsAPI`/dashboard_reports/filter_sets/${item.id.toString()}/`, signal),
      });
    },
    [bulkAction, t, confirmationColumns, onComplete]
  );
}
