import { Button, Modal, ModalVariant } from '@patternfly/react-core'
import { useCallback } from 'react'
import { usePageDialog } from './PageDialog'
import { ITableColumn, PageTable } from './PageTable'
import { IToolbarFilter } from './PageToolbar'
import { useFrameworkTranslations } from './useFrameworkTranslations'
import { ISelected } from './useTableItems'
import { IView } from './useView'

export type SelectMultipleDialogProps<T extends object> = {
  title: string
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined }
  tableColumns: ITableColumn<T>[]
  toolbarFilters: IToolbarFilter[]
  onSelect: (items: T[]) => void
  confirmText?: string
  cancelText?: string
  emptyStateTitle?: string
  errorStateTitle?: string
}

export function SelectMultipleDialog<T extends object>(props: SelectMultipleDialogProps<T>) {
  const { title, view, tableColumns, toolbarFilters, confirmText, cancelText, onSelect } = props
  const [_, setDialog] = usePageDialog()
  const onClose = useCallback(() => setDialog(undefined), [setDialog])
  const [translations] = useFrameworkTranslations()
  return (
    <Modal
      title={title}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      tabIndex={0}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            onClose()
            onSelect(view.selectedItems)
          }}
          isAriaDisabled={view.selectedItems.length === 0}
        >
          {confirmText ?? translations.confirmText}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {cancelText ?? translations.cancelText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 500,
          overflow: 'hidden',
        }}
      >
        <PageTable<T>
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          {...view}
          emptyStateTitle={props.emptyStateTitle ?? translations.noItemsFound}
          errorStateTitle={props.errorStateTitle ?? translations.errorText}
          showSelect
        />
      </div>
    </Modal>
  )
}

export function useSelectMultipleDialog<T extends object>() {
  const [_, setDialog] = usePageDialog()
  const openSelectMultipleDialog = useCallback(
    (props: SelectMultipleDialogProps<T>) => setDialog(<SelectMultipleDialog<T> {...props} />),
    [setDialog]
  )
  return openSelectMultipleDialog
}
