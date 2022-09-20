import { Button, Modal, ModalBoxBody, ModalVariant, Skeleton, Split, SplitItem } from '@patternfly/react-core'
import { useCallback, useEffect, useState } from 'react'
import { IControllerView } from '../frontend/controller/useControllerView'
import { getItemKey } from '../frontend/Data'
import { Collapse } from './Collapse'
import { useSetDialog } from './DialogContext'
import { ITableColumn, IToolbarFilter, PageTable } from './PageTable'

export function useSelectDialog<T extends { id: number }>(options: {
    view: IControllerView<T>
    tableColumns: ITableColumn<T>[]
    toolbarFilters: IToolbarFilter[]
}) {
    const { view, tableColumns, toolbarFilters } = options
    const [title, setTitle] = useState('')
    const [onSelect, setOnSelect] = useState<(item: T) => void>()
    const openSetting = useCallback((onSelect?: (item: T) => void, title?: string) => {
        setTitle(title ?? '')
        setOnSelect(() => onSelect)
    }, [])
    const setDialog = useSetDialog()
    useEffect(() => {
        if (onSelect !== undefined) {
            setDialog(
                <SelectDialog<T>
                    title={title}
                    open
                    setOpen={() => setOnSelect(undefined)}
                    onSelect={onSelect}
                    view={view}
                    tableColumns={tableColumns}
                    toolbarFilters={toolbarFilters}
                />
            )
        } else {
            setDialog(undefined)
            view.unselectAll()
        }
    }, [onSelect, setDialog, tableColumns, title, toolbarFilters, view])
    return openSetting
}

export function SelectDialog<T extends { id: number }>(props: {
    title: string
    open: boolean
    setOpen: (open: boolean) => void
    onSelect: (item: T) => void
    view: IControllerView<T>
    tableColumns: ITableColumn<T>[]
    toolbarFilters: IToolbarFilter[]
}) {
    const { title, open, setOpen, onSelect, view, tableColumns, toolbarFilters } = props
    const onClose = () => setOpen(false)
    return (
        <Modal
            title={title}
            isOpen={open}
            onClose={onClose}
            variant={ModalVariant.medium}
            tabIndex={0}
            actions={[
                <Button
                    key="confirm"
                    variant="primary"
                    onClick={() => {
                        if (view.selectedItems.length > 0) {
                            onSelect(view.selectedItems[0])
                        }
                        onClose()
                    }}
                    isAriaDisabled={view.selectedItems.length === 0}
                >
                    Confirm
                </Button>,
                <Button key="cancel" variant="link" onClick={onClose}>
                    Cancel
                </Button>,
            ]}
            hasNoBodyWrapper
        >
            <ModalBoxBody style={{ overflow: 'hidden' }}>
                <Split hasGutter>
                    {view.selectedItems.length > 0 && <SplitItem>Selected:</SplitItem>}
                    <b>
                        {view.selectedItems.map((item) => {
                            if (tableColumns && tableColumns.length > 0) {
                                return <span key={getItemKey(item)}>{tableColumns[0].cell(item)}</span>
                            }
                            return <></>
                        })}
                        <></>
                    </b>
                </Split>
            </ModalBoxBody>
            <Collapse open={view.itemCount === undefined}>
                <Skeleton height="80px"></Skeleton>
            </Collapse>
            <Collapse open={view.itemCount !== undefined}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 400,
                        overflow: 'hidden',
                    }}
                >
                    <PageTable<T>
                        tableColumns={tableColumns}
                        toolbarFilters={toolbarFilters}
                        emptyStateTitle="No organizations found"
                        errorStateTitle="Error loading organizations"
                        {...view}
                        onSelect={() => null}
                    />
                </div>
            </Collapse>
        </Modal>
    )
}
