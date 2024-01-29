import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useSourcesColumns } from './useSourcesColumns';

export function useDeleteSources(onComplete: (sources: InventorySource[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useSourcesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<InventorySource>();
  const deleteSources = (sources: InventorySource[]) => {
    bulkAction({
      title: t('Permanently delete sources', { count: sources.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} sources.', {
        count: sources.length,
      }),
      actionButtonText: t('Delete sources', { count: sources.length }),
      items: sources.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (source: InventorySource, signal) =>
        requestDelete(awxAPI`/inventory_sources/${source.id.toString()}/`, signal),
    });
  };
  return deleteSources;
}
