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
import { pfDanger, pfInfo, pfSuccess } from './components/pfcolors'
import { usePageDialog } from './PageDialog'
import { ITableColumn, PageTable } from './PageTable'
import { useFrameworkTranslations } from './useFrameworkTranslations'
import { usePaged } from './useTableItems'

export interface BulkActionDialogProps<T extends object> {
  /** The title of the model.
   * @link https://www.patternfly.org/v4/components/modal/design-guidelines#confirmation-dialogs
   */
  title: string

  /** The items to confirm for the bulk action. */
  items: T[]

  /** A function that gets a unique key for each item. */
  keyFn: (item: T) => string | number

  /** The columns to display when processing the actions. */
  actionColumns: ITableColumn<T>[]

  /** The action function to perform on each item. */
  actionFn: (item: T, signal: AbortSignal) => Promise<unknown>

  /** Callback when all the actions are complete. Returns the successful items. */
  onComplete?: (successfulItems: T[]) => void

  /** Callback called when the dialog closes. */
  onClose?: () => void

  /** The text to show for each item when the action is happening.
   * @example Deleting jobs...
   */
  processingText?: string

  /** Indicates if this is a destructive operation */
  isDanger?: boolean
}

function BulkActionDialog<T extends object>(props: BulkActionDialogProps<T>) {
  const {
    title,
    items,
    keyFn,
    actionColumns,
    actionFn,
    onComplete,
    onClose,
    processingText,
    isDanger,
  } = props
  const [translations] = useFrameworkTranslations()
  const [isProcessing, setProcessing] = useState(true)
  const [isCanceled, setCanceled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [statuses, setStatuses] = useState<Record<string | number, string | null | undefined>>()
  const [abortController] = useState(() => new AbortController())
  const [_, setDialog] = usePageDialog()

  const onCancelClicked = useCallback(() => {
    setCanceled(true)
    abortController.abort()
    setProcessing(false)
    setStatuses((statuses) => {
      const newStatuses = { ...statuses }
      for (const item of items) {
        const key = keyFn(item)
        if (newStatuses[key] === undefined) {
          newStatuses[key] = 'Cancelled'
        }
      }
      return newStatuses
    })
  }, [abortController, items, keyFn])

  const onCloseClicked = useCallback(() => {
    setDialog(undefined)
    onClose?.()
  }, [onClose, setDialog])

  useEffect(() => {
    async function process() {
      const limit = pLimit(5)
      let progress = 0
      const successfulItems: T[] = []
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
              successfulItems.push(item)
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
                setError(translations.errorText)
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
      onComplete?.(successfulItems)
    }
    void process()
  }, [abortController, actionFn, items, keyFn, onComplete, translations.errorText])

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
                {translations.cancelText}
              </Button>,
            ]
          : [
              <Button key="close" variant="secondary" onClick={onCloseClicked}>
                {translations.closeText}
              </Button>,
            ]
      }
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 560,
            overflow: 'hidden',
            borderTop: 'thin solid var(--pf-global--BorderColor--100)',
          }}
        >
          <PageTable<T>
            key="status"
            pageItems={[...paged]}
            itemCount={items.length}
            tableColumns={[
              ...actionColumns,
              {
                header: 'Status',
                cell: (item) => {
                  const key = keyFn(item)
                  const status = statuses?.[key]
                  if (status === undefined) {
                    return (
                      <span style={{ color: pfInfo }}>
                        {<PendingIcon />}&nbsp; {translations.pendingText}
                      </span>
                    )
                  }
                  if (status === null) {
                    return (
                      <span style={{ color: pfSuccess }}>
                        {<CheckCircleIcon />}&nbsp; {translations.successText}
                      </span>
                    )
                  }
                  return (
                    <span style={{ color: pfDanger }}>
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
      </ModalBoxBody>
      <ModalBoxBody style={{ paddingTop: 0 }}>
        <Progress
          value={(progress / items.length) * 100}
          title={
            abortController.signal.aborted
              ? translations.canceledText
              : error
              ? translations.errorText
              : !isProcessing
              ? translations.successText
              : processingText ?? translations.processingText
          }
          size={ProgressSize.lg}
          variant={
            error || isCanceled
              ? ProgressVariant.danger
              : progress === items.length
              ? ProgressVariant.success
              : undefined
          }
        />
      </ModalBoxBody>
    </Modal>
  )
}

export function useBulkActionDialog<T extends object>() {
  const [_, setDialog] = usePageDialog()
  const [props, setProps] = useState<BulkActionDialogProps<T>>()
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined)
        props.onClose?.()
      }
      setDialog(<BulkActionDialog<T> {...props} onClose={onCloseHandler} />)
    } else {
      setDialog(undefined)
    }
  }, [props, setDialog])
  return setProps
}
