import { Button, Checkbox, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core'
import { useCallback, useEffect, useState } from 'react'
import { usePageDialog } from './PageDialog'
import { ITableColumn, PageTable } from './PageTable'
import { useFrameworkTranslations } from './useFrameworkTranslations'
import { usePaged } from './useTableItems'

export interface BulkConfirmationDialogProps<T extends object> {
  title: string
  prompt?: string
  submitText: string
  confirmText: string
  cancelText?: string
  isDanger?: boolean
  items: T[]
  columns: ITableColumn<T>[]
  keyFn: (item: T) => string | number
  onConfirm?: (items: T[]) => void
}

function BulkConfirmationDialog<T extends object>(props: BulkConfirmationDialogProps<T>) {
  const [_, setDialog] = usePageDialog()
  const [translations] = useFrameworkTranslations()
  const onClose = useCallback(() => {
    setDialog(undefined)
  }, [setDialog])
  const onConfirm = () => props.onConfirm?.(props.items)
  const { paged, page, perPage, setPage, setPerPage } = usePaged(props.items)
  const [confirmed, setConfirmed] = useState(!props.confirmText)
  return (
    <Modal
      titleIconVariant={props.isDanger ? 'warning' : undefined}
      title={props.title}
      variant={ModalVariant.medium}
      isOpen
      onClose={onClose}
      actions={[
        <Button
          key="submit"
          variant={props.isDanger ? 'danger' : 'primary'}
          onClick={onConfirm}
          isAriaDisabled={!confirmed}
        >
          {props.submitText ?? translations.submitText}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {props.cancelText ?? translations.cancelText}
        </Button>,
      ]}
      description={props.prompt}
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 500,
            overflow: 'hidden',
            borderTop: 'thin solid var(--pf-global--BorderColor--100)',
          }}
        >
          <PageTable<T>
            key="items"
            pageItems={paged}
            itemCount={props.items.length}
            tableColumns={props.columns}
            keyFn={props.keyFn}
            page={page}
            perPage={perPage}
            setPage={setPage}
            setPerPage={setPerPage}
            compact
            errorStateTitle="Error"
            emptyStateTitle="No items"
          />
        </div>
        {props.confirmText && (
          <div style={{ marginLeft: 32, marginTop: 0, marginBottom: 8 }}>
            <Checkbox
              id="confirm"
              label={props.confirmText}
              isChecked={confirmed}
              onChange={setConfirmed}
            />
          </div>
        )}
      </ModalBoxBody>
    </Modal>
  )
}

export function useBulkConfirmationDialog<T extends object>() {
  const [_, setDialog] = usePageDialog()
  const [props, setProps] = useState<BulkConfirmationDialogProps<T>>()
  useEffect(() => {
    if (props) {
      const onCloseHandler = (items: T[]) => {
        setProps(undefined)
        props.onConfirm?.(items)
      }
      setDialog(<BulkConfirmationDialog<T> {...props} onConfirm={onCloseHandler} />)
    } else {
      setDialog(undefined)
    }
  }, [props, setDialog])
  return setProps
}
