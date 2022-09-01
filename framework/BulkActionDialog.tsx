import {
    Button,
    Checkbox,
    Modal,
    ModalVariant,
    Progress,
    ProgressMeasureLocation,
    ProgressSize,
    ProgressVariant,
} from '@patternfly/react-core'
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons'
import { useState } from 'react'
import { Collapse } from './Collapse'
import { useDialog } from './DialogContext'
import { PagePagination } from './PagePagination'
import { PageTable } from './PageTable'
import { ITableColumn } from './TableColumn'
import { usePaged } from './useTableItems'

export interface BulkActionDialogProps {
    isDanger?: boolean
}

export function BulkActionDialog<T extends object>(props: {
    title: string
    prompt?: string
    submitting: string
    submittingTitle: string
    submit: string
    confirm: string
    cancel: string
    error: string
    close: string
    success: string
    isDanger?: boolean
    items: T[]
    columns: ITableColumn<T>[]
    errorColumns: ITableColumn<T>[]
    keyFn: (item: T) => string | number
    onClose?: () => void
}) {
    const [_, setDialog] = useDialog()
    const onClose = () => {
        setDialog()
        props.onClose?.()
    }
    const [isSubmitting, setSubmitting] = useState(false)
    const [isSubmited, setSubmited] = useState(false)
    const [progress, setProgress] = useState(0)

    const [error, setError] = useState('')
    const [statuses, setStatuses] = useState<Record<string | number, string | null | undefined>>()
    const onConfirm = () => {
        async function handleConfirm() {
            try {
                setSubmitting(true)
                let progress = 0
                let hasError = false
                for (const item of props.items) {
                    if (process.env.DELAY) await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)))
                    if (Math.random() < 0.1) {
                        setStatuses((statuses) => ({ ...(statuses ?? {}), [props.keyFn(item)]: `Not found` }))
                        setError(props.error)
                        hasError = true
                    } else {
                        setStatuses((statuses) => ({ ...(statuses ?? {}), [props.keyFn(item)]: null }))
                    }
                    setProgress(++progress)
                }

                if (!hasError) {
                    await new Promise((resolve) => setTimeout(resolve, 1500))
                    onClose()
                }
            } catch {
                // todo?
            } finally {
                setSubmitting(false)
                setSubmited(true)
            }
        }
        void handleConfirm()
    }
    const { paged, page, perPage, setPage, setPerPage } = usePaged(props.items)
    const [confirmed, setConfirmed] = useState(!props.confirm)

    return (
        <Modal
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
                              {isSubmitting ? props.submitting : props.submit}
                          </Button>,
                          <Button key="cancel" variant="link" onClick={onClose}>
                              {props.cancel}
                          </Button>,
                      ]
                    : [
                          <Button key="close" variant="secondary" onClick={onClose}>
                              {props.close}
                          </Button>,
                      ]
            }
            description={<Collapse open={!isSubmitting && !isSubmited}>{props.prompt}</Collapse>}
        >
            <Collapse open={isSubmitting || isSubmited}>
                <Progress
                    value={(progress / props.items.length) * 100}
                    title={error ? props.error : progress === props.items.length ? props.success : props.submittingTitle}
                    size={ProgressSize.lg}
                    variant={error ? ProgressVariant.danger : progress === props.items.length ? ProgressVariant.success : undefined}
                    style={{ marginBottom: 16 }}
                    measureLocation={error && progress === props.items.length ? ProgressMeasureLocation.none : undefined}
                />
            </Collapse>
            {!isSubmitting && !isSubmited ? (
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: 425,
                            overflow: 'hidden',
                        }}
                    >
                        <PageTable
                            pageItems={paged}
                            itemCount={props.items.length}
                            tableColumns={props.columns}
                            keyFn={props.keyFn}
                            perPage={perPage}
                            compact
                        />
                    </div>
                    {props.items.length > perPage && (
                        <PagePagination
                            itemCount={props.items.length}
                            page={page}
                            perPage={perPage}
                            setPage={setPage}
                            setPerPage={setPerPage}
                            style={{ paddingBottom: 0, marginBottom: -8 }}
                        />
                    )}
                </>
            ) : (
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: 425,
                            overflow: 'hidden',
                        }}
                    >
                        <PageTable
                            pageItems={paged}
                            itemCount={props.items.length}
                            tableColumns={[
                                ...props.errorColumns,
                                {
                                    header: 'Status',
                                    cell: (item) => {
                                        const status = statuses?.[props.keyFn(item)]
                                        if (status === undefined) {
                                            return (
                                                <span style={{ color: 'var(--pf-global--info-color--100)' }}>
                                                    {<PendingIcon />}&nbsp; Pending
                                                </span>
                                            )
                                        }
                                        if (status === null) {
                                            return (
                                                <span style={{ color: 'var(--pf-global--success-color--100)' }}>
                                                    {<CheckCircleIcon />}&nbsp; Success
                                                </span>
                                            )
                                        }
                                        return (
                                            <span style={{ color: 'var(--pf-global--danger-color--100)' }}>
                                                {<ExclamationCircleIcon />}&nbsp; {statuses?.[props.keyFn(item)]}
                                            </span>
                                        )
                                    },
                                },
                            ]}
                            keyFn={props.keyFn}
                            perPage={perPage}
                            compact
                        />
                    </div>
                    {props.items.length > perPage && perPage === 10 && (
                        <PagePagination
                            itemCount={props.items.length}
                            page={page}
                            perPage={perPage}
                            setPage={setPage}
                            setPerPage={setPerPage}
                            style={{ paddingBottom: 0, marginBottom: -8 }}
                        />
                    )}
                </>
            )}
            {props.confirm && (
                <Collapse open={!isSubmitting && !isSubmited}>
                    <div style={{ marginLeft: 16, marginTop: 32, marginBottom: 8 }}>
                        <Checkbox id="confirm" label={props.confirm} isChecked={confirmed} onChange={setConfirmed} />
                    </div>
                </Collapse>
            )}
        </Modal>
    )
}
