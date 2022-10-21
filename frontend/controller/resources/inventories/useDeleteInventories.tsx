import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { useInventoriesColumns } from './Inventories'
import { Inventory } from './Inventory'

export function useDeleteInventories(callback: (inventories: Inventory[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useInventoriesColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const deleteInventories = (items: Inventory[]) => {
    setDialog(
      <BulkActionDialog<Inventory>
        title={t('Permanently delete inventories', { count: items.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} inventories.', {
          count: items.length,
        })}
        submitText={t('Delete inventories', { count: items.length })}
        submitting={t('Deleting inventories', { count: items.length })}
        submittingTitle={t('Deleting {{count}} inventories', { count: items.length })}
        error={t('There were errors deleting inventories', { count: items.length })}
        items={items.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={getItemKey}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onClose={callback}
        action={(inventory: Inventory) => requestDelete(`/api/v2/inventories/${inventory.id}/`)}
      />
    )
  }
  return deleteInventories
}
