import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useInventoriesColumns } from './useInventoriesColumns';

export function useDeleteInventories(onComplete: (inventories: Inventory[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useInventoriesColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Inventory>();

  const cannotDeleteInventory = (inventory: Inventory) => {
    return inventory?.summary_fields?.user_capabilities?.delete
      ? undefined
      : t('The inventory cannot be deleted due to insufficient permission.');
  };

  const deleteInventories = (inventories: Inventory[]) => {
    const undeletableInventories = inventories.filter(cannotDeleteInventory);
    bulkAction({
      title: t('Permanently delete inventories', { count: inventories.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} inventories.', {
        count: inventories.length - undeletableInventories.length,
      }),
      actionButtonText: t('Delete inventories', { count: inventories.length }),
      items: inventories.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (inventory: Inventory, signal) =>
        requestDelete(awxAPI`/inventories/${inventory.id.toString()}/`, signal),
      alertPrompts:
        undeletableInventories.length > 0
          ? [
              t(
                '{{count}} of the selected inventories cannot be deleted due to insufficient permission.',
                {
                  count: undeletableInventories.length,
                }
              ),
            ]
          : undefined,
      isItemNonActionable: cannotDeleteInventory,
    });
  };
  return deleteInventories;
}
