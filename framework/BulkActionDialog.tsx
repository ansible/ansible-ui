import { Button, Checkbox, Modal, ModalVariant, Progress, ProgressSize, ProgressVariant } from '@patternfly/react-core'
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
}) {
    const [_, setDialog] = useDialog()
    const onClose = () => setDialog()
    const [isSubmitting, setSubmitting] = useState(false)
    const [isSubmited, setSubmited] = useState(false)
    const [progress, setProgress] = useState(0)

    const [error, setError] = useState('')
    const [errors, setErrors] = useState<Record<string | number, string>>()
    const [errorItems, setErrorItems] = useState<T[]>([])
    const onConfirm = async () => {
        try {
            setSubmitting(true)
            let progress = 0
            let hasError = false
            for (const item of props.items) {
                if (process.env.NODE_ENV === 'development') await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 200))
                if (Math.random() < 0.8) {
                    setErrors((errors) => ({ ...(errors ?? {}), [props.keyFn(item)]: `Error ${progress}` }))
                    setErrorItems((errorItems) => [...errorItems, item])
                    setError(props.error)
                }
                setProgress(++progress)
                hasError = true
            }

            if (!hasError) onClose()
        } catch {
            // todo?
        } finally {
            setSubmitting(false)
            setSubmited(true)
        }
    }
    const { paged, page, perPage, setPage, setPerPage } = usePaged(props.items)
    const [confirmed, setConfirmed] = useState(!props.confirm)

    const errorItemsPagination = usePaged(errorItems)

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
                />
            </Collapse>
            <Collapse open={!isSubmitting && !isSubmited}>
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
            </Collapse>
            <Collapse open={!!errors}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 425,
                        overflow: 'hidden',
                    }}
                >
                    <PageTable
                        pageItems={errorItemsPagination.paged}
                        itemCount={errorItems.length}
                        tableColumns={[
                            ...props.errorColumns,
                            {
                                header: 'Error',
                                cell: (item) => (
                                    <span style={{ color: 'var(--pf-global--danger-color--100)' }}>{errors[props.keyFn(item)]}</span>
                                ),
                            },
                        ]}
                        keyFn={props.keyFn}
                        perPage={errorItemsPagination.perPage}
                        compact
                    />
                </div>
                {errorItems.length > perPage && (
                    <PagePagination
                        itemCount={errorItems.length}
                        {...errorItemsPagination}
                        style={{ paddingBottom: 0, marginBottom: -8 }}
                    />
                )}
            </Collapse>
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
