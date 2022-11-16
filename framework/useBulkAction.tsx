import { useCallback } from 'react'
import { BulkConfirmationDialogProps, useBulkConfirmationDialog } from './BulkConfirmationDialog'
import { BulkProgressDialogProps, useBulkProgressDialog } from './BulkProgressDialog'

export function useBulkAction<T extends object>() {
  const openBulkConfirmation = useBulkConfirmationDialog<T>()
  const openBulkProgress = useBulkProgressDialog<T>()
  const bulkAction = useCallback(
    (options: BulkConfirmationDialogProps<T> & BulkProgressDialogProps<T>) => {
      options.onConfirm = () => openBulkProgress(options)
      openBulkConfirmation(options)
    },
    [openBulkConfirmation, openBulkProgress]
  )
  return bulkAction
}
