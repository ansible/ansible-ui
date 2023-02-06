import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../Data';
import { idKeyFn } from '../../../../hub/useHubView';
import { EdaInventory } from '../../../interfaces/EdaInventory';
import { useInventoriesColumns } from './useInventoryColumns';

export function useDeleteInventories(onComplete: (inventories: EdaInventory[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useInventoriesColumns();
  const actionColumns = [confirmationColumns[0]];
  const bulkAction = useBulkConfirmation<EdaInventory>();
  const deleteInventories = (items: EdaInventory[]) => {
    bulkAction({
      title: t('Permanently delete inventories', { count: items.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} inventories.', {
        count: items.length,
      }),
      actionButtonText: t('Delete inventories', { count: items.length }),
      items: items.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: idKeyFn,
      actionFn: (inventory: EdaInventory) => requestDelete(`/eda/api/v1/inventory/${inventory.id}`),
      confirmationColumns,
      actionColumns,
      onComplete,
      isDanger: true,
    });
  };
  return deleteInventories;
}
