import {
  Button,
  Modal,
  ModalBoxBody,
  ModalVariant,
  Progress,
  ProgressSize,
  ProgressVariant,
} from '@patternfly/react-core'
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons'
import pLimit from 'p-limit'
import { useCallback, useEffect, useState } from 'react'
import { usePageDialog } from './PageDialog'
import { ITableColumn, PageTable } from './PageTable'
import { useFrameworkTranslations } from './useFrameworkTranslations'
import { usePaged } from './useTableItems'

export interface BulkProgressDialogProps<T extends object> {
  title: string
  keyFn: (item: T) => string | number
  items: T[]
  progressColumns: ITableColumn<T>[]
  actionFn: (item: T, signal: AbortSignal) => Promise<unknown>
  onClose?: (items: T[]) => void

  processingText?: string
  errorText?: string
  successText?: string
  itemPendingText?: string
  itemSuccessText?: string
  cancelText?: string
  closeText?: string

  isDanger?: boolean
}

export function BulkProgressDialog<T extends object>(props: BulkProgressDialogProps<T>) {
  const {
    title,
    keyFn,
    items,
    progressColumns,
    actionFn,
    onClose,
    processingText,
    errorText,
    itemPendingText,
    itemSuccessText,
    successText,
    cancelText,
    closeText,
    isDanger,
  } = props

  const [translations] = useFrameworkTranslations()
  const [isProcessing, setProcessing] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [statuses, setStatuses] = useState<Record<string | number, string | null | undefined>>()
  const [abortController] = useState(() => new AbortController())

  const onCancelClicked = useCallback(() => {
    abortController.abort()
    setProcessing(false)
  }, [abortController])

  const onCloseClicked = useCallback(() => {
    onClose?.(items.filter((item) => statuses?.[keyFn(item)] === null))
  }, [items, keyFn, onClose, statuses])

  useEffect(() => {
    async function process() {
      const limit = pLimit(5)
      let progress = 0
      await Promise.all(
        items.map((item: T) =>
          limit(async () => {
            if (abortController.signal.aborted) return
            const key = keyFn(item)
            try {
              await actionFn(item, abortController.signal)
              if (!abortController.signal.aborted) {
                setStatuses((statuses) => ({ ...(statuses ?? {}), [key]: null }))
              }
            } catch (err) {
              if (!abortController.signal.aborted) {
                if (err instanceof Error) {
                  const message = err.message
                  setStatuses((statuses) => ({
                    ...(statuses ?? {}),
                    [key]: message,
                  }))
                } else {
                  setStatuses((statuses) => ({
                    ...(statuses ?? {}),
                    [key]: `Unknown error`,
                  }))
                }
                setError(errorText ?? translations.errorText)
              }
            } finally {
              if (!abortController.signal.aborted) {
                setProgress(++progress)
              }
            }
          })
        )
      )
      if (!abortController.signal.aborted) {
        setProcessing(false)
      }
    }
    void process()
  }, [abortController, actionFn, errorText, items, keyFn, translations.errorText])

  const { paged, page, perPage, setPage, setPerPage } = usePaged(items)

  return (
    <Modal
      titleIconVariant={isDanger ? 'warning' : undefined}
      title={title}
      variant={ModalVariant.medium}
      isOpen
      onClose={() => {
        onCancelClicked()
        onCloseClicked()
      }}
      actions={
        isProcessing
          ? [
              <Button key="cancel" variant="link" onClick={onCancelClicked}>
                {cancelText ?? translations.cancelText}
              </Button>,
            ]
          : [
              <Button key="close" variant="secondary" onClick={onCloseClicked}>
                {closeText ?? translations.closeText}
              </Button>,
            ]
      }
      hasNoBodyWrapper
    >
      <ModalBoxBody>
        <Progress
          value={(progress / items.length) * 100}
          title={
            abortController.signal.aborted
              ? 'Cancelled'
              : error
              ? errorText ?? translations.errorText
              : progress === items.length
              ? successText ?? translations.successText
              : processingText ?? translations.processingText
          }
          size={ProgressSize.lg}
          variant={
            error
              ? ProgressVariant.danger
              : progress === items.length
              ? ProgressVariant.success
              : undefined
          }
          // measureLocation={error && progress === items.length ? ProgressMeasureLocation.none : undefined}
        />
      </ModalBoxBody>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 560,
          overflow: 'hidden',
          paddingTop: 16,
        }}
      >
        <PageTable<T>
          key="status"
          pageItems={[...paged]}
          itemCount={items.length}
          tableColumns={[
            ...progressColumns,
            {
              header: 'Status',
              cell: (item) => {
                const key = keyFn(item)
                const status = statuses?.[key]
                if (status === undefined) {
                  return (
                    <span style={{ color: 'var(--pf-global--info-color--100)' }}>
                      {<PendingIcon />}&nbsp; {itemPendingText ?? translations.pendingText}{' '}
                      {JSON.stringify(status)}
                    </span>
                  )
                }
                if (status === null) {
                  return (
                    <span
                      style={{
                        color: 'var(--pf-global--success-color--100)',
                      }}
                    >
                      {<CheckCircleIcon />}&nbsp; {itemSuccessText ?? translations.successText}
                    </span>
                  )
                }
                return (
                  <span style={{ color: 'var(--pf-global--danger-color--100)' }}>
                    {<ExclamationCircleIcon />}&nbsp; {statuses?.[key]}
                  </span>
                )
              },
            },
          ]}
          keyFn={keyFn}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          compact
          errorStateTitle=""
          emptyStateTitle="No items"
        />
      </div>
    </Modal>
  )
}

export function useBulkProgressDialog<T extends object>() {
  const [_, setDialog] = usePageDialog()
  const [props, setProps] = useState<BulkProgressDialogProps<T>>()
  useEffect(() => {
    if (props) {
      const onCloseHandler = (items: T[]) => {
        setProps(undefined)
        props.onClose?.(items)
      }
      setDialog(<BulkProgressDialog<T> {...props} onClose={onCloseHandler} />)
    } else {
      setDialog(undefined)
    }
  }, [props, setDialog])
  return setProps
}
