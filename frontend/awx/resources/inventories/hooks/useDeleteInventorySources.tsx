import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';

export function useDeleteInventorySources(
  onComplete: (inventorySources: InventorySource[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useInventorySourceColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<InventorySource>();

  const cannotDeleteInventorySources = (inventorySource: InventorySource) => {
    return inventorySource?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The inventory source cannot be deleted due to insufficient permission.');
  };

  const deleteInventories = (inventorySources: InventorySource[]) => {
    const undeletableInventorySources = inventorySources.filter(cannotDeleteInventorySources);
    bulkAction({
      title: t('Permanently delete inventory source', { count: inventorySources.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} inventory sources.', {
        count: inventorySources.length - undeletableInventorySources.length,
      }),
      actionButtonText: t('Delete inventory sources', { count: inventorySources.length }),
      items: inventorySources.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (inventorySource: InventorySource, signal) =>
        requestDelete(awxAPI`/inventory_sources/${inventorySource.id.toString()}/`, signal),
      alertPrompts:
        undeletableInventorySources.length > 0
          ? [
              t(
                '{{count}} of the selected inventory sources cannot be deleted due to insufficient permission.',
                {
                  count: undeletableInventorySources.length,
                }
              ),
            ]
          : undefined,
      isItemNonActionable: cannotDeleteInventorySources,
    });
  };
  return deleteInventories;
}
