import { useTranslation } from 'react-i18next'
import { compareStrings } from '../../../../framework'
import { useBulkAction } from '../../../../framework/useBulkAction'
import { requestDelete } from '../../../Data'
import { idKeyFn } from '../../../hub/useHubView'
import { EdaInventory } from '../../interfaces/EdaInventory'
import { useInventoriesColumns } from './useInventoryColumns'

export function useDeleteInventories(callback: (inventories: EdaInventory[]) => void) {
  const { t } = useTranslation()
  const columns = useInventoriesColumns()
  const errorColumns = columns
  const bulkAction = useBulkAction<EdaInventory>()
  const deleteInventories = (items: EdaInventory[]) => {
    bulkAction({
      title: t('Permanently delete inventories', { count: items.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} inventories.', {
        count: items.length,
      }),
      submitText: t('Delete inventories', { count: items.length }),
      errorText: t('There were errors deleting inventories', { count: items.length }),
      items: items.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: idKeyFn,
      isDanger: true,
      columns: columns,
      progressColumns: errorColumns,
      onClose: callback,
      actionFn: (inventory: EdaInventory) => requestDelete(`/api/inventories/${inventory.id}`),
    })
  }
  return deleteInventories
}
