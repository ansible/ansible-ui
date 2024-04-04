import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { getItemKey } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { Inventory } from '../../../interfaces/Inventory';
import { useInventoriesColumns } from './useInventoriesColumns';
import { InventoryWithSource } from '../InventoryPage/InventoryDetails';
import { postRequest } from '../../../../common/crud/Data';

export function useSyncInventory() {
  const { t } = useTranslation();
  const confirmationColumns = useInventoriesColumns({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useAwxBulkConfirmation<Inventory>();

  const syncInventories = (inventories: InventoryWithSource[]) => {
    bulkAction({
      title: t('Sync inventory', { count: inventories.length }),
      confirmText: t('Yes, I confirm that I want to sync inventory.'),
      actionButtonText: t('Sync inventory'),
      items: inventories.sort((l, r) => compareStrings(l.id?.toString(), r.id?.toString())),
      keyFn: getItemKey,
      confirmationColumns,
      actionColumns,
      actionFn: (inventory: InventoryWithSource) =>
        postRequest(
          awxAPI`/inventory_sources/${inventory.source?.id.toString() || ''}/update/`,
          {}
        ),
    });
  };
  return syncInventories;
}
