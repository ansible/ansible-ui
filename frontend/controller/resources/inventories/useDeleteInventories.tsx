import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { useNameColumn } from '../../../common/columns';
import { getItemKey, requestDelete } from '../../../Data';
import { useInventoriesColumns } from './Inventories';
import { Inventory } from './Inventory';

export function useDeleteInventories(onComplete: (inventories: Inventory[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useInventoriesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<Inventory>();
  const deleteInventories = (inventories: Inventory[]) => {
    bulkAction({
      title:
        inventories.length === 1
          ? t('Permanently delete inventory')
          : t('Permanently delete inventories'),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} inventories.', {
        count: inventories.length,
      }),
      actionButtonText: t('Delete inventory', { count: inventories.length }),
      items: inventories.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (inventory: Inventory) => requestDelete(`/api/v2/inventories/${inventory.id}/`),
    });
  };
  return deleteInventories;
}
