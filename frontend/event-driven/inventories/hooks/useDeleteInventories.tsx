import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { requestDelete } from '../../../Data'
import { idKeyFn } from '../../../hub/useHubView'
import { EdaInventory } from '../../interfaces/EdaInventory'
import { useInventoriesColumns } from './useInventoryColumns'

export function useDeleteInventories(callback: (inventories: EdaInventory[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useInventoriesColumns()
  const errorColumns = columns
  const deleteInventories = (items: EdaInventory[]) => {
    setDialog(
      <BulkActionDialog<EdaInventory>
        title={t('Permanently delete inventories', { count: items.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} inventories.', {
          count: items.length,
        })}
        submitText={t('Delete inventories', { count: items.length })}
        submitting={t('Deleting inventories', { count: items.length })}
        submittingTitle={t('Deleting {{count}} inventories', { count: items.length })}
        error={t('There were errors deleting inventories', { count: items.length })}
        items={items.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={idKeyFn}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onClose={callback}
        action={(inventory: EdaInventory) => requestDelete(`/api/inventories/${inventory.id}`)}
      />
    )
  }
  return deleteInventories
}
