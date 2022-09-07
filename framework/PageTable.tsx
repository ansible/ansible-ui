import {
    Button,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    EmptyStateSecondaryActions,
    Skeleton,
    Split,
    SplitItem,
    Title,
    Toolbar,
    ToolbarContent,
    ToolbarItem,
} from '@patternfly/react-core'
import { SearchIcon } from '@patternfly/react-icons'
import { ActionsColumn, IAction, SortByDirection, TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base'
import useResizeObserver from '@react-hook/resize-observer'
import { Fragment, MouseEvent, UIEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useColumnModal } from './ColumnModal'
import { useWindowSizeOrLarger, WindowSize } from './components/useBreakPoint'
import { IItemAction, isItemActionClick } from './ItemActions'
import { PageContent } from './PageContent'
import { PagePagination } from './PagePagination'
import { PageToolbar2 } from './PageToolbar'
import { useSettings } from './Settings'
import { ITableColumn } from './TableColumn'
import { IToolbarAction, ToolbarActionType } from './Toolbar'

export type PageTableProps<T extends object> = {
    pageItems?: T[]
    toolbarActions?: IToolbarAction<T>[]
    rowActions?: IItemAction<T>[]
    keyFn: (item: T) => string | number
    tableColumns: ITableColumn<T>[]
    selectItem?: (item: T) => void
    unselectItem?: (item: T) => void
    isSelected?: (item: T) => boolean
    sort: string
    setSort: (sort: string) => void
    sortDirection: 'asc' | 'desc'
    setSortDirection: (sortDirection: 'asc' | 'desc') => void
    itemCount?: number
    perPage: number
    compact?: boolean
    clearAllFilters?: () => void
}

export function PageTable<T extends object>(props: PageTableProps<T>) {
    const {
        tableColumns,
        pageItems,
        selectItem,
        unselectItem,
        isSelected,
        keyFn,
        rowActions,
        toolbarActions,
        itemCount,
        perPage,
        clearAllFilters,
    } = props
    const showSelect = toolbarActions?.find((toolbarAction) => ToolbarActionType.bulk === toolbarAction.type) !== undefined
    const containerRef = useRef<HTMLDivElement>(null)
    const [scroll, setScroll] = useState<{ left: number; right: number; top: number; bottom: number }>({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    })
    const updateScroll = useCallback((div: HTMLDivElement | null) => {
        if (!div) return
        setScroll({
            top: div.scrollTop,
            bottom: div.scrollHeight - div.clientHeight - div.scrollTop,
            left: div.scrollLeft,
            right: div.scrollWidth - div.clientWidth - div.scrollLeft,
        })
    }, [])
    const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => updateScroll(event.currentTarget), [updateScroll])
    useResizeObserver(containerRef, () => updateScroll(containerRef.current))
    useEffect(() => updateScroll(containerRef.current), [updateScroll])

    const settings = useSettings()
    const { openColumnModal, columnModal, managedColumns } = useColumnModal(tableColumns)

    return (
        <Fragment>
            {columnModal}
            <PageToolbar2 {...props} openColumnModal={openColumnModal} />
            <div className="pf-c-scroll-inner-wrapper" style={{ height: '100%' }} ref={containerRef} onScroll={onScroll}>
                <TableComposable
                    aria-label="Simple table"
                    variant={props.compact ? 'compact' : settings.tableLayout === 'compact' ? 'compact' : undefined}
                    gridBreakPoint=""
                    isStickyHeader
                >
                    {itemCount === undefined ? (
                        <Thead>
                            <Tr>
                                <Th>
                                    <Skeleton />
                                </Th>
                            </Tr>
                        </Thead>
                    ) : (
                        <TableHead {...props} showSelect={showSelect} scrollLeft={scroll.left > 0} scrollRight={scroll.right > 1} />
                    )}
                    <Tbody>
                        {itemCount === undefined
                            ? new Array(perPage).fill(0).map((_, index) => (
                                  <Tr key={index}>
                                      <Td>
                                          <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                                              <Skeleton height="27px" />
                                          </div>
                                      </Td>
                                  </Tr>
                              ))
                            : pageItems === undefined
                            ? new Array(Math.min(perPage, itemCount)).fill(0).map((_, index) => (
                                  <Tr key={index}>
                                      {showSelect && <Td></Td>}
                                      <Td colSpan={managedColumns.length}>
                                          <div style={{ paddingTop: 5, paddingBottom: 5 }}>
                                              <Skeleton height="27px" />
                                          </div>
                                      </Td>
                                  </Tr>
                              ))
                            : pageItems?.map((item, rowIndex) => (
                                  <TableRow<T>
                                      key={keyFn ? keyFn(item) : rowIndex}
                                      columns={managedColumns}
                                      item={item}
                                      isItemSelected={isSelected?.(item)}
                                      selectItem={selectItem}
                                      unselectItem={unselectItem}
                                      rowActions={rowActions}
                                      rowIndex={rowIndex}
                                      showSelect={showSelect}
                                      scrollLeft={scroll.left > 0}
                                      scrollRight={scroll.right > 1}
                                  />
                              ))}
                    </Tbody>
                </TableComposable>
                {itemCount === 0 && (
                    <div style={{ margin: 'auto' }}>
                        <EmptyState>
                            <EmptyStateIcon icon={SearchIcon} />
                            <Title headingLevel="h2" size="lg">
                                No results found
                            </Title>
                            <EmptyStateBody>No results match this filter criteria. Adjust your filters and try again.</EmptyStateBody>
                            {clearAllFilters && (
                                <EmptyStateSecondaryActions>
                                    <Button variant="link" onClick={clearAllFilters}>
                                        Clear all filters
                                    </Button>
                                </EmptyStateSecondaryActions>
                            )}
                        </EmptyState>
                    </div>
                )}
            </div>
            <PagePagination {...props} />
        </Fragment>
    )
}

function TableHead<T extends object>(props: {
    tableColumns: ITableColumn<T>[]
    rowActions?: IItemAction<T>[]
    sort: string
    setSort: (sort: string) => void
    sortDirection: 'asc' | 'desc'
    setSortDirection: (sortDirection: 'asc' | 'desc') => void
    showSelect?: boolean
    scrollLeft?: boolean
    scrollRight?: boolean
}) {
    const { tableColumns: columns, rowActions: itemActions, sort, setSort, sortDirection, setSortDirection, showSelect } = props

    const getColumnSort = useCallback<(columnIndex: number, column: ITableColumn<T>) => ThSortType | undefined>(
        (columnIndex: number, column: ITableColumn<T>) => {
            if (!column.sort) return undefined
            return {
                onSort: (_event: MouseEvent, _columnIndex: number, sortByDirection: SortByDirection) => {
                    if (column.sort) {
                        setSort(column.sort)
                        setSortDirection(sortByDirection)
                    }
                },
                sortBy: {
                    index: column.sort === sort ? columnIndex : undefined,
                    direction: column.sort === sort ? sortDirection : undefined,
                    defaultDirection: column.defaultSortDirection,
                },
                columnIndex,
            }
        },
        [setSort, setSortDirection, sort, sortDirection]
    )

    return (
        <Thead>
            <Tr>
                {showSelect && (
                    <Th isStickyColumn style={{ width: '0%' }} stickyMinWidth="45px" hasRightBorder={props.scrollLeft}>
                        &nbsp;
                    </Th>
                )}
                {columns
                    .filter((column) => column.enabled !== false)
                    .map((column, index) => {
                        return (
                            <Th
                                modifier="fitContent"
                                key={column.header}
                                style={{ minWidth: column.minWidth }}
                                sort={getColumnSort(index, column)}
                            >
                                {column.header}
                            </Th>
                        )
                    })}
                {itemActions !== undefined && (
                    <Th
                        style={{
                            // zIndex: 100 - rowIndex,
                            paddingRight: 8,
                            paddingLeft: 0,
                            width: '0%',
                            right: 0,
                            // borderLeft: '1px solid var(--pf-global--BorderColor--dark-100)',
                        }}
                        isStickyColumn
                        stickyMinWidth="45px"
                        className={props.scrollRight ? 'pf-m-border-left' : undefined}
                    >
                        &nbsp;
                    </Th>
                )}
            </Tr>
        </Thead>
    )
}

function TableRow<T extends object>(props: {
    columns: ITableColumn<T>[]
    item: T
    isItemSelected: boolean
    selectItem: (item: T) => void
    unselectItem: (item: T) => void
    rowActions?: IItemAction<T>[]
    rowIndex: number
    showSelect: boolean
    scrollLeft?: boolean
    scrollRight?: boolean
}) {
    const { columns, selectItem, unselectItem, isItemSelected, item, rowActions, rowIndex, showSelect } = props
    const md = useWindowSizeOrLarger(WindowSize.xl)
    return (
        <Tr
            className={isItemSelected ? 'selected' : undefined}
            // style={{ backgroundColor: theme === ThemeE.Dark ? 'transparent' : undefined }}
            isRowSelected={isItemSelected}
        >
            {showSelect && (
                <Th
                    select={{
                        onSelect: (_event, isSelecting) => {
                            if (isSelecting) {
                                selectItem(item)
                            } else {
                                unselectItem(item)
                            }
                        },
                        isSelected: isItemSelected,
                    }}
                    style={{ width: '0%', paddingLeft: md ? undefined : 20 }}
                    isStickyColumn
                    stickyMinWidth="0px"
                    hasRightBorder={props.scrollLeft}
                />
            )}
            <TableCells
                rowIndex={rowIndex}
                columns={columns}
                item={item}
                rowActions={rowActions}
                scrollLeft={props.scrollLeft}
                scrollRight={props.scrollRight}
            />
        </Tr>
    )
}

function TableCells<T extends object>(props: {
    rowIndex: number
    columns: ITableColumn<T>[]
    item: T
    rowActions?: IItemAction<T>[]
    scrollLeft?: boolean
    scrollRight?: boolean
}) {
    // const md = useWindowSizeOrLarger(WindowSize.xl)

    const { columns, item, rowActions, rowIndex } = props
    const actions: IAction[] | undefined = useMemo(
        () =>
            rowActions?.map((rowAction) => {
                if (isItemActionClick(rowAction)) {
                    const Icon = rowAction.icon
                    return {
                        title: (
                            <Split hasGutter>
                                {Icon && (
                                    <SplitItem>
                                        <Icon />
                                    </SplitItem>
                                )}
                                <SplitItem>{rowAction.label}</SplitItem>
                            </Split>
                        ),
                        onClick: () => {
                            rowAction.onClick(item)
                        },
                    }
                }
                return { isSeparator: true }
            }),
        [item, rowActions]
    )
    return useMemo(
        () => (
            <Fragment>
                {columns
                    .filter((column) => column.enabled !== false)
                    .map((column) => {
                        return (
                            <Td key={column.header} dataLabel={column.header} modifier="nowrap">
                                {column.cell(item)}
                            </Td>
                        )
                    })}
                {actions !== undefined && (
                    <Th
                        // isActionCell
                        style={{
                            zIndex: 100 - rowIndex,
                            paddingRight: 8,
                            paddingLeft: 0,
                            width: '0%',
                            right: 0,
                            // borderLeft: '1px solid var(--pf-global--BorderColor--dark-100)',
                        }}
                        isStickyColumn
                        stickyMinWidth="0px"
                        className={props.scrollRight ? 'pf-m-border-left' : undefined}
                    >
                        <ActionsColumn
                            // dropdownDirection="up" // TODO handle....
                            items={actions}
                            // isDisabled={repo.name === '4'} // Also arbitrary for the example
                            // actionsToggle={exampleChoice === 'customToggle' ? customActionsToggle : undefined}
                        />
                    </Th>
                )}
            </Fragment>
        ),
        [actions, columns, item, props.scrollRight, rowIndex]
    )
}

// function TablePagination(props: {
//     itemCount: number
//     page: number
//     perPage: number
//     onSetPage: (event: unknown, page: number) => void
//     onPerPageSelect: (event: unknown, perPage: number) => void
// }) {
//     const { itemCount, page, perPage, onSetPage, onPerPageSelect } = props
//     return useMemo(
//         () => (
//             <Pagination
//                 itemCount={itemCount}
//                 widgetId="pagination-options-menu-bottom"
//                 perPage={perPage}
//                 page={page}
//                 variant={PaginationVariant.bottom}
//                 onSetPage={onSetPage}
//                 onPerPageSelect={onPerPageSelect}
//                 // perPage={this.state.perPage}
//                 // page={this.state.page}
//                 // variant={PaginationVariant.bottom}
//                 // onSetPage={this.onSetPage}
//                 // onPerPageSelect={this.onPerPageSelect}
//                 style={{ borderTop: '1px solid var(--pf-global--BorderColor--dark-100)', marginTop: -1, zIndex: 300 }}
//             />
//         ),
//         [itemCount, onPerPageSelect, onSetPage, page, perPage]
//     )
// }

export function LoadingTable(props: { toolbar?: boolean; padding?: boolean; perPage?: number }) {
    return (
        <PageContent padding={props.padding}>
            {props.toolbar && (
                <Toolbar style={{ borderBottom: 'thin solid var(--pf-global--BorderColor--100)' }}>
                    <ToolbarContent>
                        <ToolbarItem style={{ width: '100%' }}>
                            <Skeleton height="36px" />
                        </ToolbarItem>
                    </ToolbarContent>
                </Toolbar>
            )}
            <TableComposable gridBreakPoint="">
                <Thead>
                    <Tr>
                        <Th>
                            <Skeleton />
                        </Th>
                    </Tr>
                </Thead>
                <Tbody style={{ backgroundColor: 'transparent' }}>
                    {new Array(props.perPage ?? 5).fill(0).map((_, index) => (
                        <Tr key={index}>
                            <Td>
                                <Skeleton />
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </TableComposable>
        </PageContent>
    )
}
