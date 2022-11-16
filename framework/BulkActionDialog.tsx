import {
  Button,
  Checkbox,
  Modal,
  ModalBoxBody,
  ModalVariant,
  Progress,
  ProgressMeasureLocation,
  ProgressSize,
  ProgressVariant,
} from '@patternfly/react-core'
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons'
import pLimit from 'p-limit'
import { useCallback, useState } from 'react'
import { Collapse } from './components/Collapse'
import { usePageDialog } from './PageDialog'
import { ITableColumn, PageTable } from './PageTable'
import { useFrameworkTranslations } from './useFrameworkTranslations'
import { usePaged } from './useTableItems'

export interface BulkActionDialogProps {
  isDanger?: boolean
}

export function BulkActionDialog<T extends object>(props: {
  title: string
  prompt?: string
  submitting: string
  submittingTitle: string
  submitText: string
  confirmText: string
  cancelText?: string
  error: string
  closeText?: string
  successText?: string
  pendingText?: string
  isDanger?: boolean
  items: T[]

  /** These are the columns shown when confirming the bulk actions. */
  columns: ITableColumn<T>[]

  /**
   * These are the columns shown when processing the bulk actions plus an error column.
   * @note This is usually the name column, unless the name column is not unique enough to identify the item.
   */
  errorColumns: ITableColumn<T>[]

  keyFn: (item: T) => string | number
  action: (item: T) => Promise<void>
  onClose?: (items: T[]) => void
}) {
  const [_, setDialog] = usePageDialog()
  const [translations] = useFrameworkTranslations()
  const [isSubmitting, setSubmitting] = useState(false)
  const [isSubmited, setSubmited] = useState(false)
  const [progress, setProgress] = useState(0)

  const [error, setError] = useState('')
  const [statuses, setStatuses] = useState<Record<string | number, string | null | undefined>>()
  const onClose = useCallback(() => {
    props.onClose?.(props.items.filter((item) => statuses?.[props.keyFn(item)] === null))
    setDialog(undefined)
  }, [props, setDialog, statuses])

  const onConfirm = () => {
    async function handleConfirm() {
      const limit = pLimit(5)
      setSubmitting(true)
      let progress = 0
      await Promise.all(
        props.items.map((item: T) =>
          limit(async () => {
            const key = props.keyFn(item)
            try {
              await props.action(item)
              setStatuses((statuses) => ({ ...(statuses ?? {}), [key]: null }))
            } catch (err) {
              if (err instanceof Error) {
                const message = err.message
                setStatuses((statuses) => ({ ...(statuses ?? {}), [key]: message }))
              } else {
                setStatuses((statuses) => ({
                  ...(statuses ?? {}),
                  [key]: `Unknown error`,
                }))
              }
              setError(props.error)
            } finally {
              setProgress(++progress)
            }
          })
        )
      )
      setSubmitting(false)
      setSubmited(true)
    }
    void handleConfirm()
  }

  const { paged, page, perPage, setPage, setPerPage } = usePaged(props.items)
  const [confirmed, setConfirmed] = useState(!props.confirmText)

  return (
    <Modal
      titleIconVariant={props.isDanger ? 'warning' : undefined}
      title={props.title}
      variant={ModalVariant.medium}
      isOpen
      onClose={onClose}
      actions={
        !isSubmited
          ? [
              <Button
                key="submit"
                variant={props.isDanger ? 'danger' : 'primary'}
                onClick={onConfirm}
                isDisabled={!confirmed || isSubmitting || isSubmited}
                isLoading={isSubmitting}
              >
                {isSubmitting
                  ? props.submitting ?? translations.submittingText
                  : props.submitText ?? translations.submitText}
              </Button>,
              <Button key="cancel" variant="link" onClick={onClose}>
                {props.cancelText ?? translations.cancelText}
              </Button>,
            ]
          : [
              <Button key="close" variant="secondary" onClick={onClose}>
                {props.closeText ?? translations.closeText}
              </Button>,
            ]
      }
      description={<Collapse open={!isSubmitting && !isSubmited}>{props.prompt}</Collapse>}
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Collapse open={isSubmitting || isSubmited}>
          <ModalBoxBody style={{ paddingTop: 0 }}>
            <Progress
              value={(progress / props.items.length) * 100}
              title={
                error
                  ? props.error
                  : progress === props.items.length
                  ? props.successText ?? translations.successText
                  : props.submittingTitle
              }
              size={ProgressSize.lg}
              variant={
                error
                  ? ProgressVariant.danger
                  : progress === props.items.length
                  ? ProgressVariant.success
                  : undefined
              }
              measureLocation={
                error && progress === props.items.length ? ProgressMeasureLocation.none : undefined
              }
            />
          </ModalBoxBody>
        </Collapse>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 500,
            overflow: 'hidden',
            borderTop: 'thin solid var(--pf-global--BorderColor--100)',
          }}
        >
          {!isSubmitting && !isSubmited ? (
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
              disableBodyPadding
            />
          ) : (
            <PageTable<T>
              key="status"
              pageItems={[...paged]}
              itemCount={props.items.length}
              tableColumns={[
                ...props.errorColumns,
                {
                  header: 'Status',
                  cell: (item) => {
                    const key = props.keyFn(item)
                    const status = statuses?.[key]
                    if (status === undefined) {
                      return (
                        <span
                          style={{
                            color: 'var(--pf-global--info-color--100)',
                          }}
                        >
                          {<PendingIcon />}&nbsp; {props.pendingText ?? translations.pendingText}{' '}
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
                          {<CheckCircleIcon />}&nbsp;{' '}
                          {props.successText ?? translations.successText}
                        </span>
                      )
                    }
                    return (
                      <span
                        style={{
                          color: 'var(--pf-global--danger-color--100)',
                        }}
                      >
                        {<ExclamationCircleIcon />}&nbsp; {statuses?.[key]}
                      </span>
                    )
                  },
                },
              ]}
              keyFn={props.keyFn}
              page={page}
              perPage={perPage}
              setPage={setPage}
              setPerPage={setPerPage}
              compact
              errorStateTitle=""
              emptyStateTitle="No items"
              disableBodyPadding
            />
          )}
        </div>
        {props.confirmText && (
          <Collapse open={!isSubmitting && !isSubmited}>
            <div style={{ marginLeft: 32, marginTop: 0, marginBottom: 8 }}>
              <Checkbox
                id="confirm"
                label={props.confirmText}
                isChecked={confirmed}
                onChange={setConfirmed}
              />
            </div>
          </Collapse>
        )}
      </ModalBoxBody>
    </Modal>
  )
}
